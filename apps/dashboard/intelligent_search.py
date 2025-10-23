"""
Enhanced Intelligent Search Service

Google-like search functionality with:
- Fuzzy matching (Levenshtein distance)
- Partial matching with smart ranking
- Phonetic matching (Soundex algorithm)
- N-gram matching
- Prefix/suffix matching
- Search suggestions and auto-correction
- Intelligent ranking system
"""

import re
import math
from difflib import SequenceMatcher
from collections import defaultdict, Counter
import logging

logger = logging.getLogger(__name__)


class IntelligentSearchEngine:
    """
    Advanced search engine with multiple matching algorithms
    """
    
    def __init__(self):
        self.soundex_cache = {}
        self.ngram_cache = {}
        
    def search(self, query, users_data, max_results=100):
        """
        Main search function that combines multiple search algorithms
        
        Args:
            query (str): Search query
            users_data (list): List of user dictionaries with 'email', 'display_name', etc.
            max_results (int): Maximum number of results to return
            
        Returns:
            list: Ranked search results with scores
        """
        if not query or not users_data:
            return []
        
        query = query.strip().lower()
        if len(query) < 1:
            return []
        
        # Score all users
        scored_results = []
        
        for user in users_data:
            score = self._calculate_user_score(query, user)
            if score > 0:
                user_result = user.copy()
                user_result['search_score'] = score
                user_result['match_reasons'] = self._get_match_reasons(query, user)
                scored_results.append(user_result)
        
        # Sort by score (highest first)
        scored_results.sort(key=lambda x: x['search_score'], reverse=True)
        
        # Apply intelligent boosting
        scored_results = self._apply_intelligent_boosting(query, scored_results)
        
        return scored_results[:max_results]
    
    def _calculate_user_score(self, query, user):
        """
        Calculate comprehensive score for a user based on multiple factors
        Completely redesigned to prioritize real names for single character searches
        """
        email = user.get('email', '').lower()
        display_name = user.get('display_name', '').lower()
        original_name = user.get('original_name', '').lower()
        
        # For single character searches, completely prioritize real names
        if len(query) == 1:
            # Extract actual name parts from the email and data
            user_folder = None
            
            # Look for user_folder in the screenshots data to get the actual user email
            recent_screenshots = user.get('recent_screenshots', [])
            if recent_screenshots:
                user_folder = recent_screenshots[0].get('user_folder', '')
            
            # Extract real user email from folder structure  
            real_email = ''
            if user_folder and '_at_' in user_folder:
                # Convert "nawaz_at_dxdglobal.com" to "nawaz@dxdglobal.com"
                real_email = user_folder.replace('_at_', '@')
            
            # Extract name parts from real email
            name_parts = []
            if real_email:
                username = real_email.split('@')[0]
                # Split by common separators to get name parts
                parts = re.split(r'[._-]+', username)
                name_parts.extend([part for part in parts if part and len(part) >= 2])
            
            # Also extract from display_name if it's different from the technical folder name
            if display_name and display_name != email and not display_name.startswith('users_'):
                name_parts.extend(display_name.split())
            
            # Check for names that START with the query character
            max_score = 0
            for name_part in name_parts:
                if self._is_likely_real_name(name_part) and name_part.startswith(query):
                    # MASSIVE score for real names starting with the character
                    max_score = max(max_score, 5000)
                    break
            
            # If no real name match found, heavily penalize system folders
            if max_score == 0:
                if self._is_system_folder(email) or email.startswith('users_'):
                    return 1  # Minimal score for system folders
                # Check if the email itself might contain the character
                elif query in email:
                    return 50  # Very low score for technical matches
            
            return max_score
        
        else:
            # For longer queries, use enhanced scoring but still prioritize real names
            name_parts = []
            
            # Extract user email from screenshots if available
            recent_screenshots = user.get('recent_screenshots', [])
            if recent_screenshots:
                user_folder = recent_screenshots[0].get('user_folder', '')
                if user_folder and '_at_' in user_folder:
                    real_email = user_folder.replace('_at_', '@')
                    username = real_email.split('@')[0]
                    parts = re.split(r'[._-]+', username)
                    name_parts.extend([part for part in parts if part])
            
            if display_name and display_name != email:
                name_parts.extend(display_name.split())
            if original_name and original_name != display_name and original_name != email:
                name_parts.extend(original_name.split())
            
            max_score = 0
            for name_part in name_parts:
                if self._is_likely_real_name(name_part):
                    score = self._calculate_text_score(query, name_part)
                    max_score = max(max_score, score * 2.0)  # Boost real names
                else:
                    score = self._calculate_text_score(query, name_part)
                    max_score = max(max_score, score * 0.3)  # Penalize technical terms
            
            # Also check full texts with appropriate weighting
            email_score = self._calculate_text_score(query, email) * 0.5
            display_score = self._calculate_text_score(query, display_name) * 1.0
            original_score = self._calculate_text_score(query, original_name) * 1.0
            
            max_score = max(max_score, email_score, display_score, original_score)
            
            return max_score
    
    def _is_system_folder(self, text):
        """
        Check if this appears to be a system/technical folder rather than a user
        """
        if not text:
            return False
        
        system_folders = {
            'users_screenshots', 'user_screenshots', 'screenshots', 'system', 
            'admin', 'api', 'public', 'private', 'temp', 'tmp', 'logs', 'log',
            'backup', 'archive', 'cache', 'config', 'settings', 'data'
        }
        
        return text.lower() in system_folders
    
    def _is_likely_real_name(self, text):
        """
        Determine if a text string is likely a real person's name
        """
        if not text or len(text) < 2:
            return False
        
        # Technical/system terms that are NOT real names
        technical_terms = {
            'users', 'user', 'screenshots', 'screenshot', 'admin', 'test', 'demo',
            'api', 'system', 'server', 'client', 'app', 'web', 'data', 'temp',
            'tmp', 'public', 'private', 'default', 'config', 'settings', 'logs',
            'log', 'backup', 'archive', 'cache', 'session', 'auth', 'login',
            'register', 'profile', 'account', 'dashboard', 'panel', 'control'
        }
        
        if text.lower() in technical_terms:
            return False
        
        # Names typically don't have many special characters or numbers
        if any(char in text for char in ['_', '.', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']):
            # But allow common name patterns like "john.doe" or "mary-jane"
            if text.count('.') <= 1 and text.count('-') <= 1 and text.count('_') <= 1:
                # Remove special chars and check if remaining looks like name
                clean_text = re.sub(r'[._-]', '', text)
                return len(clean_text) >= 2 and clean_text.isalpha()
            return False
        
        # Names are typically alphabetic
        if not text.isalpha():
            return False
        
        # Names are usually 2+ characters
        if len(text) < 2:
            return False
        
        return True
    
    def _calculate_text_score(self, query, text):
        """
        Calculate score for query against text with enhanced prefix matching
        """
        if not query or not text:
            return 0
        
        query = query.lower().strip()
        text = text.lower().strip()
        
        # 1. Exact match (highest score)
        if query == text:
            return 1000
        
        # 2. PREFIX MATCH - HEAVILY PRIORITIZED for single characters and short queries
        if text.startswith(query):
            # For single character searches, give massive boost to prefix matches
            if len(query) == 1:
                return 950  # Very high score for single char prefix
            elif len(query) == 2:
                return 920  # High score for 2-char prefix  
            else:
                return 900 + (10 - min(len(query), 10))  # Scale by query length
        
        # 3. Word starts with query (important for names like "Haseeb")
        words = text.split()
        for word in words:
            if word.startswith(query):
                if len(query) == 1:
                    return 900  # High score for single char word start
                elif len(query) == 2:
                    return 880
                else:
                    return 850 + (10 - min(len(query), 10))
        
        # 4. Contains match (moderate score)
        if query in text:
            # Position matters - earlier in text = higher score
            position = text.find(query)
            position_bonus = max(0, 100 - position * 2)
            ratio = len(query) / len(text)
            return 600 + int(ratio * 150) + position_bonus
        
        # 5. Word boundary matches
        word_score = self._calculate_word_boundary_score(query, text)
        if word_score > 0:
            return word_score
        
        # 6. Fuzzy matching (edit distance)
        fuzzy_score = self._calculate_fuzzy_score(query, text)
        if fuzzy_score > 0:
            return fuzzy_score
        
        # 7. N-gram matching
        ngram_score = self._calculate_ngram_score(query, text)
        if ngram_score > 0:
            return ngram_score
        
        # 8. Phonetic matching (sounds like)
        phonetic_score = self._calculate_phonetic_score(query, text)
        if phonetic_score > 0:
            return phonetic_score
        
        # 9. Character frequency matching
        char_freq_score = self._calculate_character_frequency_score(query, text)
        return char_freq_score
    
    def _calculate_word_boundary_score(self, query, text):
        """
        Calculate score based on word boundary matches
        """
        # Split text into words
        words = re.findall(r'\\b\\w+\\b', text)
        score = 0
        
        for word in words:
            if query == word:
                score = max(score, 800)
            elif word.startswith(query):
                score = max(score, 600 + (50 - len(query) + len(word)))
            elif query in word:
                ratio = len(query) / len(word)
                score = max(score, 400 + int(ratio * 150))
        
        return score
    
    def _calculate_fuzzy_score(self, query, text):
        """
        Calculate fuzzy matching score using Levenshtein distance
        """
        # For short queries, be more strict
        if len(query) <= 2:
            if self._levenshtein_distance(query, text) <= 1:
                return 300
            return 0
        
        # Calculate similarity ratio
        similarity = SequenceMatcher(None, query, text).ratio()
        
        # Also check substrings
        max_similarity = similarity
        
        # Check all substrings of text with same length as query
        text_len = len(text)
        query_len = len(query)
        
        if text_len >= query_len:
            for i in range(text_len - query_len + 1):
                substring = text[i:i + query_len]
                substr_similarity = SequenceMatcher(None, query, substring).ratio()
                max_similarity = max(max_similarity, substr_similarity)
        
        # Score based on similarity
        if max_similarity >= 0.8:
            return int(300 + (max_similarity - 0.8) * 500)
        elif max_similarity >= 0.6:
            return int(200 + (max_similarity - 0.6) * 250)
        elif max_similarity >= 0.4:
            return int(100 + (max_similarity - 0.4) * 250)
        
        return 0
    
    def _calculate_ngram_score(self, query, text):
        """
        Calculate N-gram matching score
        """
        if len(query) < 2:
            return 0
        
        # Generate bigrams and trigrams
        query_bigrams = self._get_ngrams(query, 2)
        query_trigrams = self._get_ngrams(query, 3) if len(query) >= 3 else []
        
        text_bigrams = self._get_ngrams(text, 2)
        text_trigrams = self._get_ngrams(text, 3) if len(text) >= 3 else []
        
        # Calculate matches
        bigram_matches = len(set(query_bigrams) & set(text_bigrams))
        trigram_matches = len(set(query_trigrams) & set(text_trigrams))
        
        # Score calculation
        bigram_score = (bigram_matches / max(len(query_bigrams), 1)) * 200
        trigram_score = (trigram_matches / max(len(query_trigrams), 1)) * 150
        
        return int(bigram_score + trigram_score)
    
    def _calculate_phonetic_score(self, query, text):
        """
        Calculate phonetic matching score using Soundex algorithm
        """
        query_soundex = self._soundex(query)
        
        # Check soundex of the whole text and words in text
        text_soundex = self._soundex(text)
        
        if query_soundex == text_soundex:
            return 250
        
        # Check individual words
        words = re.findall(r'\\b\\w+\\b', text)
        for word in words:
            word_soundex = self._soundex(word)
            if query_soundex == word_soundex:
                return 200
        
        return 0
    
    def _calculate_character_frequency_score(self, query, text):
        """
        Calculate score based on character frequency similarity
        """
        if len(query) < 2:
            return 0
        
        query_chars = Counter(query)
        text_chars = Counter(text)
        
        # Calculate Jaccard similarity for character sets
        intersection = sum((query_chars & text_chars).values())
        union = sum((query_chars | text_chars).values())
        
        if union == 0:
            return 0
        
        jaccard = intersection / union
        
        # Additional scoring for character coverage
        query_char_coverage = len(set(query) & set(text)) / len(set(query))
        
        score = (jaccard * 0.6 + query_char_coverage * 0.4) * 150
        
        return int(score)
    
    def _apply_intelligent_boosting(self, query, results):
        """
        Apply intelligent boosting to completely prioritize real users over system folders
        """
        if not results:
            return results
        
        for result in results:
            email = result.get('email', '').lower()
            
            # Extract real user information from screenshots
            recent_screenshots = result.get('recent_screenshots', [])
            user_folder = ''
            real_email = ''
            
            if recent_screenshots:
                user_folder = recent_screenshots[0].get('user_folder', '')
                if user_folder and '_at_' in user_folder:
                    real_email = user_folder.replace('_at_', '@')
            
            # For single character searches, apply massive boost to real users
            if len(query) == 1:
                if real_email:
                    # Extract name from real email
                    username = real_email.split('@')[0]
                    name_parts = re.split(r'[._-]+', username)
                    
                    # Check if any name part starts with the query
                    has_real_name_prefix = False
                    for part in name_parts:
                        if self._is_likely_real_name(part) and part.startswith(query):
                            has_real_name_prefix = True
                            break
                    
                    if has_real_name_prefix:
                        result['search_score'] *= 100.0  # Massive boost for real name prefix
                        continue
                
                # Heavily penalize system folders for single char searches
                if self._is_system_folder(email) or email.startswith('users_'):
                    result['search_score'] *= 0.001  # Almost eliminate system folders
            
            else:
                # For longer queries, still boost real users but less aggressively
                if real_email:
                    username = real_email.split('@')[0]
                    name_parts = re.split(r'[._-]+', username)
                    
                    for part in name_parts:
                        if self._is_likely_real_name(part) and (part.startswith(query) or query in part):
                            result['search_score'] *= 5.0
                            break
                
                # Penalize system folders
                if self._is_system_folder(email) or email.startswith('users_'):
                    result['search_score'] *= 0.1
        
        # Re-sort after boosting
        results.sort(key=lambda x: x['search_score'], reverse=True)
        
        return results
    
    def _get_match_reasons(self, query, user):
        """
        Get list of reasons why this user matched the search
        """
        reasons = []
        email = user.get('email', '').lower()
        display_name = user.get('display_name', '').lower()
        
        # Check different types of matches
        if query == email:
            reasons.append('Exact email match')
        elif email.startswith(query):
            reasons.append('Email starts with search term')
        elif query in email:
            reasons.append('Email contains search term')
        
        if query == display_name:
            reasons.append('Exact name match')
        elif display_name.startswith(query):
            reasons.append('Name starts with search term')
        elif query in display_name:
            reasons.append('Name contains search term')
        
        # Fuzzy match reasons
        similarity = SequenceMatcher(None, query, email).ratio()
        if similarity >= 0.7:
            reasons.append(f'Similar to email ({int(similarity*100)}% match)')
        
        if not reasons:
            reasons.append('Partial match found')
        
        return reasons
    
    def _get_ngrams(self, text, n):
        """Generate n-grams from text"""
        if len(text) < n:
            return [text]
        
        ngrams = []
        for i in range(len(text) - n + 1):
            ngrams.append(text[i:i + n])
        
        return ngrams
    
    def _levenshtein_distance(self, s1, s2):
        """Calculate Levenshtein distance between two strings"""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]
    
    def _soundex(self, text):
        """
        Generate Soundex code for phonetic matching
        """
        if not text:
            return '0000'
        
        if text in self.soundex_cache:
            return self.soundex_cache[text]
        
        text = text.upper()
        soundex = text[0]
        
        # Soundex mapping
        mapping = {
            'BFPV': '1', 'CGJKQSXZ': '2', 'DT': '3',
            'L': '4', 'MN': '5', 'R': '6'
        }
        
        for char in text[1:]:
            for key, value in mapping.items():
                if char in key:
                    if value != soundex[-1]:  # Avoid duplicates
                        soundex += value
                    break
        
        # Pad or truncate to 4 characters
        soundex = soundex[:4].ljust(4, '0')
        
        self.soundex_cache[text] = soundex
        return soundex
    
    def generate_suggestions(self, query, all_users):
        """
        Generate search suggestions based on available users
        """
        if not query or len(query) < 1:
            return []
        
        suggestions = set()
        
        # Get all unique terms from user data
        all_terms = set()
        for user in all_users:
            email = user.get('email', '')
            if email:
                all_terms.add(email.lower())
                # Add parts of email
                if '@' in email:
                    username = email.split('@')[0].lower()
                    all_terms.add(username)
                    # Add parts separated by dots, underscores
                    for part in re.split(r'[._-]', username):
                        if len(part) > 1:
                            all_terms.add(part)
        
        query_lower = query.lower()
        
        # Find suggestions
        for term in all_terms:
            # Exact prefix match
            if term.startswith(query_lower) and term != query_lower:
                suggestions.add(term)
            
            # Fuzzy suggestions
            elif len(query) >= 2:
                distance = self._levenshtein_distance(query_lower, term)
                if distance <= 2 and len(term) >= len(query) - 1:
                    suggestions.add(term)
        
        return sorted(list(suggestions))[:5]


# Global instance
intelligent_search = IntelligentSearchEngine()

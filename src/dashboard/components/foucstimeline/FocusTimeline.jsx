// ActivityTimeline.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { TextField } from '@mui/material';
import { useLanguage } from '../../context/LanguageContext';

const Wrapper = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
`;

const SearchBox = styled(TextField)`
  width: 240px;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 20px;
  border-left: 2px dashed #e5e7eb;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Icon = styled.div`
  position: absolute;
  left: -12px;
  top: 0;
  background: #8b5cf6;
  color: white;
  border-radius: 50%;
  padding: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  flex: 1;
  margin-left: 20px;
`;

const TitleText = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: #6b7280;
`;

const Media = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 6px;

  img {
    border-radius: 6px;
    width: 48px;
    height: 48px;
    object-fit: cover;
  }
`;

const Badge = styled.div`
  background: #22c55e;
  color: white;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  margin-left: auto;
`;

const FocusTimeline = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');

  const activities = [
    {
      title: t('purchasedFromMediaTek') || 'Purchased from MediaTek',
      subtitle: t('loremIpsumShort') || 'Lorem ipsum dolor sit amet consecte',
      media: [
        'https://via.placeholder.com/48x48?text=1',
        'https://via.placeholder.com/48x48?text=2',
        'https://via.placeholder.com/48x48?text=3'
      ],
      time: t('minsAgo', { count: 4 }) || '04 Mins Ago'
    },
    {
      title: t('purchasedFromMediaTek') || 'Purchased from MediaTek',
      subtitle: t('loremIpsumShort') || 'Lorem ipsum dolor sit amet consecte',
      media: [
        'https://via.placeholder.com/48x48?text=A',
        'https://via.placeholder.com/48x48?text=B',
        'https://via.placeholder.com/48x48?text=C'
      ],
      time: t('minsAgo', { count: 4 }) || '04 Mins Ago'
    },
    {
      title: t('purchasedFromMediaTek') || 'Purchased from MediaTek',
      subtitle: t('daysLeftNotification') || '3 days left notification to submit new products',
      media: [],
      time: t('minsAgo', { count: 4 }) || '04 Mins Ago'
    }
  ];

  const filteredActivities = activities.filter((act) =>
    act.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Wrapper>
      <Header>
        <Title>{t('userActivity') || 'User Activity'}</Title>
        <SearchBox
          size="small"
          placeholder={t('searchActivity') || 'Search activity...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Header>
      <Timeline>
        {filteredActivities.map((item, index) => (
          <TimelineItem key={index}>
            <Icon>
              <i className="fas fa-bag-shopping"></i>
            </Icon>
            <Content>
              <TitleText>{item.title}</TitleText>
              <Subtitle dangerouslySetInnerHTML={{ __html: item.subtitle }} />
              {item.media.length > 0 && (
                <Media>
                  {item.media.map((src, i) => (
                    <img key={i} src={src} alt="" />
                  ))}
                </Media>
              )}
            </Content>
            <Badge>{item.time}</Badge>
          </TimelineItem>
        ))}
      </Timeline>
    </Wrapper>
  );
};

export default FocusTimeline;

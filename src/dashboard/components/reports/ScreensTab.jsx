import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Skeleton,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogContent
} from '@mui/material';
import Pagination from '@mui/material/Pagination';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CloseIcon from '@mui/icons-material/Close';
import dayjs from 'dayjs';

const getSizeLabel = (sizeMb) => {
  if (sizeMb === null || sizeMb === undefined || Number.isNaN(Number(sizeMb))) {
    return null;
  }
  const numericValue = Number(sizeMb);
  if (numericValue >= 1) {
    return `${numericValue.toFixed(2)} MB`;
  }
  return `${(numericValue * 1024).toFixed(0)} KB`;
};

const formatDateTime = (timestamp, date, time) => {
  if (timestamp) {
    const parsed = dayjs(timestamp);
    if (parsed.isValid()) {
      // Add 3 hours for Turkey timezone (UTC+3)
      const turkeyTime = parsed.add(3, 'hours');
      return {
        dateLabel: turkeyTime.format('MMM D, YYYY'),
        timeLabel: turkeyTime.format('hh:mm A'),
      };
    }
  }
  const parsedDate = date ? dayjs(date) : null;
  if (parsedDate && parsedDate.isValid()) {
    // Add 3 hours for Turkey timezone (UTC+3)
    const turkeyDate = parsedDate.add(3, 'hours');
    return {
      dateLabel: turkeyDate.format('MMM D, YYYY'),
      timeLabel: time || 'Time unavailable',
    };
  }
  return {
    dateLabel: 'Date unavailable',
    timeLabel: time || 'Time unavailable',
  };
};

const ScreensTab = ({
  theme,
  screenshotCountData,
  screenshots = [],
  screenshotsTotal = 0,
  screenshotsPage = 1,
  screenshotsPerPage = 10,
  screenshotsDateRange = [null, null],
  isLoadingScreenshots = false,
  screenshotsError = null,
  screenshotsOrder = 'desc',
  onScreenshotsPageChange,
  onScreenshotsPerPageChange,
  onScreenshotsRefresh,
  onScreenshotsOrderChange,
  selectedEmployee,
}) => {
  const [startDate, endDate] = Array.isArray(screenshotsDateRange)
    ? screenshotsDateRange
    : [null, null];
  const [activeScreenshotIndex, setActiveScreenshotIndex] = useState(null);
  const [sortOrder, setSortOrder] = useState(screenshotsOrder || 'desc');

  // Sync local sortOrder with prop when it changes
  useEffect(() => {
    if (screenshotsOrder) {
      setSortOrder(screenshotsOrder);
    }
  }, [screenshotsOrder]);

  const perPageOptions = useMemo(() => {
    const options = new Set();
    
    // Always include standard pagination options
    const standardOptions = [10, 50, 100];
    standardOptions.forEach(opt => options.add(opt));
    
    // Generate options in intervals of 100 until we cover screenshotsTotal
    if (screenshotsTotal > 0) {
      if (screenshotsTotal < 100) {
        // If screenshotsTotal is less than 100, add it if it's not a standard option
        if (!standardOptions.includes(screenshotsTotal)) {
          options.add(screenshotsTotal);
        }
      } else {
        // Add options: 100, 200, 300, ... stopping before exceeding screenshotsTotal
        for (let i = 100; i < screenshotsTotal; i += 100) {
          options.add(i);
        }
        
        // Always add screenshotsTotal to cover all screenshots
        options.add(screenshotsTotal);
      }
    }
    
    // Ensure current screenshotsPerPage is in options if it's not already
    if (screenshotsPerPage && screenshotsPerPage > 0) {
      options.add(screenshotsPerPage);
    }
    
    // Convert Set to Array and sort
    return Array.from(options).sort((a, b) => a - b);
  }, [screenshotsTotal, screenshotsPerPage]);
  
  // Use screenshots directly from backend (already sorted and paginated)
  const displayedScreenshots = useMemo(() => {
    if (!Array.isArray(screenshots)) return [];
    // Backend already handles pagination and sorting, so use screenshots as-is
    return screenshots;
  }, [screenshots]);
  const summaryMetrics = useMemo(() => {
    if (!screenshotCountData) return [];

    return [
      {
        key: 'total',
        label: 'Total Screenshots',
        value: screenshotCountData.total_screenshots,
        color: '#3b82f6',
      },
      {
        key: 'perHour',
        label: 'Per Hour',
        value: screenshotCountData.screenshots_per_hour,
        color: '#10b981',
      },
      {
        key: 'duration',
        label: 'Monitoring Duration',
        value: screenshotCountData.monitoring_duration,
        color: '#f59e0b',
      },
      {
        key: 'activeHours',
        label: 'Active Hours',
        value: screenshotCountData.active_hours,
        color: '#8b5cf6',
      },
    ].filter(metric => metric.value !== undefined && metric.value !== null);
  }, [screenshotCountData]);

  const hourlyBuckets = Array.isArray(screenshotCountData?.hourly_counts)
    ? screenshotCountData.hourly_counts
    : [];

  const totalPages = Math.max(
    1,
    Math.ceil((screenshotsTotal || 0) / (screenshotsPerPage || 1))
  );

  const placeholderItems = useMemo(() => {
    const perPageCount = screenshotsPerPage || 10;
    const rows = Math.max(1, Math.ceil(perPageCount / 3));
    const totalPlaceholders = rows * 3;
    return Array.from({ length: totalPlaceholders }, (_, index) => index);
  }, [screenshotsPerPage]);

  const filtersSummary = useMemo(() => {
    if (startDate && endDate) {
      // Add 3 hours for Turkey timezone (UTC+3)
      const startLabel = dayjs(startDate).add(3, 'hours').format('MMM D, YYYY');
      const endLabel = dayjs(endDate).add(3, 'hours').format('MMM D, YYYY');
      if (startLabel === endLabel) {
        return startLabel;
      }
      return `${startLabel} – ${endLabel}`;
    }
    return 'All dates';
  }, [startDate, endDate]);

  const handlePerPageSelect = (event) => {
    if (onScreenshotsPerPageChange) {
      onScreenshotsPerPageChange(Number(event.target.value));
    }
  };

  const handleSortOrderChange = (event) => {
    const newOrder = event.target.value;
    setSortOrder(newOrder);
    // Notify parent to refetch with new order
    if (onScreenshotsOrderChange) {
      onScreenshotsOrderChange(newOrder);
    }
  };

  const handleCardClick = (index) => {
    if (!displayedScreenshots[index]) return;
    setActiveScreenshotIndex(index);
  };

  const handleCloseModal = () => setActiveScreenshotIndex(null);

  const handleModalNavigation = useCallback((direction) => {
    setActiveScreenshotIndex((prevIndex) => {
      if (prevIndex === null) return prevIndex;
      const total = displayedScreenshots.length;
      if (!total) return null;

      if (direction === 'next') {
        return prevIndex < total - 1 ? prevIndex + 1 : prevIndex;
      }

      if (direction === 'previous') {
        return prevIndex > 0 ? prevIndex - 1 : prevIndex;
      }

      return prevIndex;
    });
  }, [displayedScreenshots.length]);

  const handleModalKeyDown = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      handleModalNavigation('previous');
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      handleModalNavigation('next');
    } else if (event.key === 'Escape') {
      handleCloseModal();
    }
  }, [handleModalNavigation, handleCloseModal]);

  const activeScreenshot = activeScreenshotIndex !== null
    ? displayedScreenshots[activeScreenshotIndex]
    : null;
  const modalDateTime = activeScreenshot
    ? formatDateTime(activeScreenshot.timestamp, activeScreenshot.date, activeScreenshot.time)
    : null;
  const modalSizeLabel = activeScreenshot ? getSizeLabel(activeScreenshot.size_mb) : null;
  const canGoPrevious = activeScreenshotIndex > 0;
  const canGoNext = activeScreenshotIndex !== null && activeScreenshotIndex < displayedScreenshots.length - 1;

  const emptyStateMessage = selectedEmployee
    ? `No screenshots found for ${selectedEmployee.display_name || selectedEmployee.email || 'the selected employee'} in this range.`
    : 'Select an employee to view their screenshots.';

  return (
    <Box
      sx={{
        backgroundColor: theme.colors.surface,
        borderRadius: 3,
        minHeight: '100%',
        border: `1px solid ${theme.colors.border || 'rgba(0,0,0,0.08)'}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Box>
          <Typography variant="h5" sx={{ color: theme.colors.text.primary, fontWeight: 600 }}>
            {selectedEmployee && (selectedEmployee?.display_name || selectedEmployee?.name)} {selectedEmployee ? '\'s' : ''} Screenshots
          </Typography>
          {/* <Typography variant="body2" sx={{ color: theme.colors.text.secondary, mt: 0.5 }}>
            {filtersSummary}
          </Typography> */}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {isLoadingScreenshots && (
            <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
              Loading screenshots…
            </Typography>
          )}
        </Stack>
      </Stack>

      {!!summaryMetrics.length && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {summaryMetrics.map((metric) => (
            <Grid item xs={12} sm={6} md={3} key={metric.key}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.colors.background || theme.colors.surface,
                  border: `1px solid ${theme.colors.border || 'rgba(0,0,0,0.05)'}`,
                  height: '100%',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: theme.colors.text.secondary, fontWeight: 500 }}
                >
                  {metric.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mt: 1, color: metric.color, fontWeight: 700 }}
                >
                  {metric.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {!!hourlyBuckets.length && (
        <Box
          sx={{
            mt: 3,
            border: `1px solid ${theme.colors.border || 'rgba(0,0,0,0.05)'}`,
            borderRadius: 2,
            p: 2,
            backgroundColor: theme.colors.background || theme.colors.surface,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: theme.colors.text.primary }}>
            Hourly Distribution
          </Typography>
          <Grid container spacing={1}>
            {hourlyBuckets.map((hourSlot, index) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={`${hourSlot.hour}-${index}`}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.colors.border || 'rgba(0,0,0,0.06)'}`,
                    backgroundColor: theme.colors.background || theme.colors.surface,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: theme.colors.text.secondary }}>
                    {hourSlot.hour || `${index}:00`}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.colors.primary || '#2563eb' }}>
                    {hourSlot.count ?? hourSlot.screenshots ?? 0}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {screenshotsError && (
        <Box
          sx={{
            mt: 3,
            p: 3,
            textAlign: 'center',
            borderRadius: 2,
            border: `1px solid ${theme.mode === 'dark' ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.3)'}`,
            backgroundColor: theme.mode === 'dark' ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
            color: theme.mode === 'dark' ? '#fca5a5' : '#b91c1c',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'inherit' }}>
            Failed to load screenshots
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'inherit' }}>
            {screenshotsError}
          </Typography>
          {onScreenshotsRefresh && (
            <Button
              variant="contained"
              size="small"
              sx={{ 
                mt: 2,
                backgroundColor: theme.colors.primary || '#2563eb',
                color: '#fff',
                '&:hover': {
                  backgroundColor: theme.mode === 'dark' ? '#3b82f6' : '#1d4ed8',
                },
              }}
              onClick={onScreenshotsRefresh}
            >
              Try again
            </Button>
          )}
        </Box>
      )}

      <Divider sx={{ my: 3, borderColor: theme.colors.border }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 2,
        }}
      >
        {isLoadingScreenshots
          ? placeholderItems.map((item) => (
              <Box key={`skeleton-${item}`}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Skeleton variant="rectangular" height={180} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                  </CardContent>
                </Card>
              </Box>
            ))
          : displayedScreenshots.map((screenshot, index) => {
              const { dateLabel, timeLabel } = formatDateTime(
                screenshot.timestamp,
                screenshot.date,
                screenshot.time
              );
              const sizeLabel = getSizeLabel(screenshot.size_mb);

              return (
                <Box key={screenshot.id}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: `1px solid ${theme.colors.border || 'rgba(0,0,0,0.08)'}`,
                      backgroundColor: theme.colors.surface,
                      boxShadow: 'none',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.mode === 'dark' 
                          ? '0 12px 24px rgba(0,0,0,0.3)' 
                          : '0 12px 24px rgba(15,23,42,0.12)',
                      },
                    }}
                  >
                    <CardActionArea onClick={() => handleCardClick(index)}>
                      <Box sx={{ position: 'relative', pt: '62%' }}>
                        {screenshot.thumbnail_url || screenshot.screenshot_url ? (
                          <CardMedia
                            component="img"
                            image={screenshot.thumbnail_url || screenshot.screenshot_url}
                            alt={screenshot.filename || 'Screenshot'}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: theme.colors.background || 'rgba(148,163,184,0.15)',
                              color: theme.colors.text.secondary,
                              flexDirection: 'column',
                            }}
                          >
                            <ImageNotSupportedIcon fontSize="large" />
                            <Typography variant="caption">Preview unavailable</Typography>
                          </Box>
                        )}
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: theme.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(15,23,42,0.55)',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <ZoomInMapIcon fontSize="small" />
                        </Box>
                      </Box>
                      <CardContent sx={{ minHeight: 96, backgroundColor: theme.colors.surface }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 0.5, color: theme.colors.text.primary }}
                          noWrap
                        >
                          {screenshot.filename || screenshot.project_folder || 'Screenshot'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
                          {dateLabel} · {timeLabel}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                          {sizeLabel && (
                            <Chip
                              size="small"
                              label={sizeLabel}
                              sx={{ backgroundColor: 'rgba(59,130,246,0.12)', color: theme.colors.primary || '#2563eb' }}
                            />
                          )}
                          {/* {screenshot.project_folder && (
                            <Chip
                              size="small"
                              label={screenshot.project_folder}
                              sx={{ backgroundColor: 'rgba(15,118,110,0.12)', color: '#0f766e' }}
                            />
                          )} */}
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Box>
              );
            })}
      </Box>

      {!isLoadingScreenshots && (!screenshots || screenshots.length === 0) && !screenshotsError && (
        <Box
          sx={{
            borderRadius: 3,
            border: `2px dashed ${theme.colors.border || 'rgba(148,163,184,0.6)'}`,
            p: 4,
            textAlign: 'center',
            color: theme.colors.text.secondary,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            No screenshots to display
          </Typography>
          <Typography variant="body2">{emptyStateMessage}</Typography>
        </Box>
      )}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        sx={{ mt: 3 }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <FormControl
            size="small"
            sx={{
              minWidth: 160,
              '& .MuiInputLabel-root': {
                color: theme.colors.text.secondary,
              },
              '& .MuiOutlinedInput-root': {
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background || theme.colors.surface,
                '& fieldset': {
                  borderColor: theme.colors.border,
                },
                '&:hover fieldset': {
                  borderColor: theme.colors.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.colors.primary,
                },
              },
            }}
          >
            <InputLabel id="screenshots-per-page-label">Per Page</InputLabel>
            <Select
              labelId="screenshots-per-page-label"
              value={screenshotsPerPage}
              label="Per Page"
              onChange={handlePerPageSelect}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text.primary,
                    '& .MuiMenuItem-root': {
                      color: theme.colors.text.primary,
                      '&:hover': {
                        backgroundColor: theme.colors.background || 'rgba(59,130,246,0.1)',
                      },
                    },
                  },
                },
              }}
            >
              {perPageOptions.map((option) => (
                <MenuItem value={option} key={option}>
                  {option} screenshots
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            size="small"
            sx={{
              minWidth: 200,
              '& .MuiInputLabel-root': {
                color: theme.colors.text.secondary,
              },
              '& .MuiOutlinedInput-root': {
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background || theme.colors.surface,
                '& fieldset': {
                  borderColor: theme.colors.border,
                },
                '&:hover fieldset': {
                  borderColor: theme.colors.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.colors.primary,
                },
              },
            }}
          >
            <InputLabel id="screenshots-sort-order-label">Sort Order</InputLabel>
            <Select
              labelId="screenshots-sort-order-label"
              value={sortOrder}
              label="Sort Order"
              onChange={handleSortOrderChange}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text.primary,
                    '& .MuiMenuItem-root': {
                      color: theme.colors.text.primary,
                      '&:hover': {
                        backgroundColor: theme.colors.background || 'rgba(59,130,246,0.1)',
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="desc">Latest screenshots first</MenuItem>
              <MenuItem value="asc">Oldest screenshots first</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box>
          <Typography variant="caption" sx={{ color: theme.colors.text.secondary }}>
            Showing {displayedScreenshots.length || 0} of {screenshotsTotal || 0}
          </Typography>
        </Box>
      </Stack>

      {screenshotsTotal > screenshotsPerPage && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            color="primary"
            page={Math.min(screenshotsPage, totalPages)}
            count={totalPages}
            onChange={onScreenshotsPageChange}
            disabled={isLoadingScreenshots}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                color: theme.colors.text.primary,
                '&.Mui-selected': {
                  backgroundColor: theme.colors.primary,
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: theme.colors.primary,
                  },
                },
                '&:hover': {
                  backgroundColor: theme.colors.background || 'rgba(59,130,246,0.1)',
                },
              },
            }}
          />
        </Box>
      )}

      {activeScreenshot && (
        <Dialog
          open
          fullWidth
          maxWidth="lg"
          onClose={handleCloseModal}
          onKeyDown={handleModalKeyDown}
          sx={{
            zIndex: 10000,
            '& .MuiBackdrop-root': {
              zIndex: 10000,
            },
          }}
          PaperProps={{
            sx: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              zIndex: 10000,
            },
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              position: 'relative',
              backgroundColor: theme.mode === 'dark' ? '#000' : '#0f172a',
              maxHeight: '90vh',
              // overflowY: 'auto',
              // scrollbarWidth: 'thin',
              // scrollbarColor: `${theme.colors.border} ${theme.colors.background}`,
              // '&::-webkit-scrollbar': {
              //   width: 2,
              // },
              // '&::-webkit-scrollbar-track': {
              //   backgroundColor: theme.colors.background,
              //   borderRadius: 3,
              // },
              // '&::-webkit-scrollbar-thumb': {
              //   backgroundColor: theme.colors.border,
              //   borderRadius: 3,
              // },
              // '&::-webkit-scrollbar-thumb:hover': {
              //   backgroundColor: theme.colors.text.tertiary,
              // },
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                color: '#fff',
                backgroundColor: 'rgba(15,23,42,0.5)',
                '&:hover': { backgroundColor: 'rgba(15,23,42,0.7)' },
              }}
              aria-label="Close screenshot preview"
            >
              <CloseIcon />
            </IconButton>

            {canGoPrevious && (
              <IconButton
                onClick={() => handleModalNavigation('previous')}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 16,
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  color: '#fff',
                  backgroundColor: 'rgba(15,23,42,0.5)',
                  '&:hover': { backgroundColor: 'rgba(15,23,42,0.7)' },
                }}
                aria-label="Previous screenshot"
              >
                <ArrowBackIosNewIcon />
              </IconButton>
            )}
            {canGoNext && (
              <IconButton
                onClick={() => handleModalNavigation('next')}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: 16,
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  color: '#fff',
                  backgroundColor: 'rgba(15,23,42,0.5)',
                  '&:hover': { backgroundColor: 'rgba(15,23,42,0.7)' },
                }}
                aria-label="Next screenshot"
              >
                <ArrowForwardIosIcon />
              </IconButton>
            )}

            {activeScreenshot.screenshot_url || activeScreenshot.thumbnail_url ? (
              <Box
                component="img"
                src={activeScreenshot.screenshot_url || activeScreenshot.thumbnail_url}
                alt={activeScreenshot.filename || 'Screenshot preview'}
                sx={{
                  width: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  display: 'block',
                  backgroundColor: theme.mode === 'dark' ? '#000' : '#0f172a',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  minHeight: '60vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <ImageNotSupportedIcon fontSize="large" />
                <Typography variant="subtitle1" sx={{ color: '#fff' }}>
                  Preview unavailable
                </Typography>
              </Box>
            )}
{/* 
            <Box
              sx={{
                p: 2,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text.primary,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {activeScreenshot.filename || activeScreenshot.project_folder || 'Screenshot'}
              </Typography>
              {modalDateTime && (
                <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
                  {modalDateTime.dateLabel} · {modalDateTime.timeLabel}
                </Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                {modalSizeLabel && (
                  <Chip
                    size="small"
                    label={modalSizeLabel}
                    sx={{ backgroundColor: 'rgba(59,130,246,0.12)', color: theme.colors.primary || '#2563eb' }}
                  />
                )}
                {activeScreenshot.project_folder && (
                  <Chip
                    size="small"
                    label={activeScreenshot.project_folder}
                    sx={{ backgroundColor: 'rgba(15,118,110,0.12)', color: '#0f766e' }}
                  />
                )}
              </Stack>
            </Box> */}
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default ScreensTab;
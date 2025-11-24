import React, { useMemo } from 'react';
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
  Tooltip,
  Skeleton,
  Button,
  Divider,
  Grid
} from '@mui/material';
import Pagination from '@mui/material/Pagination';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
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
  screenshotsPerPage = 9,
  screenshotsDateRange = [null, null],
  isLoadingScreenshots = false,
  screenshotsError = null,
  onScreenshotsPageChange,
  onScreenshotsPerPageChange,
  onScreenshotsDateRangeChange,
  onScreenshotsRefresh,
  selectedEmployee,
}) => {
  const [startDate, endDate] = Array.isArray(screenshotsDateRange)
    ? screenshotsDateRange
    : [null, null];

  const perPageOptions = useMemo(() => {
    const options = [];
    
    // Generate options in intervals of 100 until we cover screenshotsTotal
    if (screenshotsTotal > 0) {
      if (screenshotsTotal < 100) {
        // If screenshotsTotal is less than 100, just add it
        options.push(screenshotsTotal);
      } else {
        // Add options: 100, 200, 300, ... stopping before exceeding screenshotsTotal
        for (let i = 100; i < screenshotsTotal; i += 100) {
          options.push(i);
        }
        
        // Always add screenshotsTotal to cover all screenshots
        if (!options.includes(screenshotsTotal)) {
          options.push(screenshotsTotal);
        }
      }
    }
    
    // Ensure current screenshotsPerPage is in options if it's not already
    if (screenshotsPerPage && !options.includes(screenshotsPerPage)) {
      options.push(screenshotsPerPage);
      options.sort((a, b) => a - b); // Sort to maintain order
    }
    
    return options;
  }, [screenshotsTotal, screenshotsPerPage]);
  const displayedScreenshots = useMemo(() => {
    const perPageCount = screenshotsPerPage || 9;
    return Array.isArray(screenshots) ? screenshots.slice(0, perPageCount) : [];
  }, [screenshots, screenshotsPerPage]);
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
    const perPageCount = screenshotsPerPage || 9;
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

  const handleDateRangeChange = (value) => {
    onScreenshotsDateRangeChange?.(value);
  };

  const handleCardClick = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const emptyStateMessage = selectedEmployee
    ? `No screenshots found for ${selectedEmployee.display_name || selectedEmployee.email || 'the selected employee'} in this range.`
    : 'Select an employee to view their screenshots.';

  return (
    <Box
      sx={{
        p: 3,
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
            Screenshot Monitoring
          </Typography>
          <Typography variant="body2" sx={{ color: theme.colors.text.secondary, mt: 0.5 }}>
            {filtersSummary}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {isLoadingScreenshots && (
            <Typography variant="body2" sx={{ color: theme.colors.text.secondary }}>
              Loading screenshots…
            </Typography>
          )}
          <Tooltip title="Refresh screenshots">
            <span>
              <IconButton
                onClick={onScreenshotsRefresh}
                disabled={isLoadingScreenshots}
                size="small"
                sx={{
                  backgroundColor: theme.colors.backgroundAlt || 'rgba(59,130,246,0.08)',
                  color: theme.colors.primary || '#2563eb',
                  '&:hover': { backgroundColor: theme.colors.primary, color: '#fff' }
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
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

      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 2,
          border: `1px solid ${theme.colors.border || 'rgba(0,0,0,0.05)'}`,
          backgroundColor: theme.colors.backgroundAlt || '#fff',
        }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          justifyContent="space-between"
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateRangePicker
              value={[startDate, endDate]}
              onChange={handleDateRangeChange}
              calendars={2}
              disableFuture
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                  sx: {
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
                  },
                },
                popper: {
                  sx: {
                    '& .MuiPaper-root': {
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text.primary,
                      border: `1px solid ${theme.colors.border}`,
                    },
                    '& .MuiPickersCalendarHeader-root': {
                      color: theme.colors.text.primary,
                    },
                    '& .MuiDayCalendar-weekContainer .MuiPickersDay-root': {
                      color: theme.colors.text.primary,
                      '&.Mui-selected': {
                        backgroundColor: theme.colors.primary,
                        color: '#fff',
                      },
                      '&:hover': {
                        backgroundColor: theme.colors.background || 'rgba(59,130,246,0.1)',
                      },
                    },
                  },
                },
              }}
            />
          </LocalizationProvider>

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

            <Box>
              <Typography variant="caption" sx={{ color: theme.colors.text.secondary }}>
                Showing {(displayedScreenshots.length || 0)} of {screenshotsTotal || 0}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>

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
          : displayedScreenshots.map((screenshot) => {
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
                    <CardActionArea onClick={() => handleCardClick(screenshot.screenshot_url)}>
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
                          <OpenInNewIcon fontSize="small" />
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
                          {screenshot.project_folder && (
                            <Chip
                              size="small"
                              label={screenshot.project_folder}
                              sx={{ backgroundColor: 'rgba(15,118,110,0.12)', color: '#0f766e' }}
                            />
                          )}
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
            mt: 4,
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
    </Box>
  );
};

export default ScreensTab;
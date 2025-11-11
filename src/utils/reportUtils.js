import dayjs from 'dayjs';

export const getProfilePhotoUrl = (user) => {
  if (!user || !user.profile_url || !user.staff_id) {
    return null;
  }

  const profileUrl = `https://crm.deluxebilisim.com/uploads/staff_profile_images/${user.staff_id}/small_${encodeURIComponent(user.profile_url)}`;

  return profileUrl;
};

export const sanitizeS3Url = (url) => {
  if (!url) return url;
  let sanitizedUrl = url.replace(/s3\.\(['"]?([^'"]+)['"]?,?\)\.amazonaws\.com/g, 's3.$1.amazonaws.com');
  sanitizedUrl = sanitizedUrl.replace(/\(['"]?([^'"]+)['"]?,?\)/g, '$1');
  return sanitizedUrl;
};

export const resolveTimestamp = (screenshot) => {
  const candidates = [
    screenshot.timestamp,
    screenshot.datetime,
    screenshot.created_at,
    screenshot.last_modified,
    screenshot.captured_at,
    screenshot.date && screenshot.time ? `${screenshot.date}T${screenshot.time}` : null,
    screenshot.date ? `${screenshot.date}T00:00:00` : null,
  ].filter(Boolean);

  for (const value of candidates) {
    const parsed = dayjs(value);
    if (parsed.isValid()) {
      return parsed.toISOString();
    }
  }

  if (screenshot.filename) {
    const match = screenshot.filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return dayjs(match[1]).toISOString();
    }
  }

  return null;
};

export const toScreenshotRecord = (screenshot, fallbackEmail, fallbackIndex = 0) => {
  if (!screenshot) return null;

  const screenshotUrl = sanitizeS3Url(
    screenshot.screenshot_url ||
    screenshot.image_url ||
    screenshot.url ||
    screenshot.original_url
  );

  const thumbnailUrl = sanitizeS3Url(
    screenshot.thumbnail_url ||
    screenshot.thumb_url ||
    screenshot.preview_url ||
    screenshot.thumbnail ||
    screenshotUrl
  );

  if (!screenshotUrl && !thumbnailUrl) return null;

  const timestamp = resolveTimestamp(screenshot);
  const timestampDay = timestamp && dayjs(timestamp).isValid()
    ? dayjs(timestamp)
    : null;

  const uniqueId = screenshot.id ||
    screenshot.filename ||
    screenshot.full_key ||
    screenshot.file_key ||
    `${fallbackIndex}-${timestamp || thumbnailUrl || screenshotUrl}`;

  const sizeMbRaw = screenshot.size_mb ?? screenshot.file_size_mb;
  const sizeMb = typeof sizeMbRaw === 'number'
    ? Number(sizeMbRaw.toFixed(2))
    : sizeMbRaw
      ? Number(parseFloat(sizeMbRaw))
      : screenshot.size_bytes
        ? Number((Number(screenshot.size_bytes) / (1024 * 1024)).toFixed(2))
        : null;

  return {
    id: uniqueId,
    filename: screenshot.filename || null,
    screenshot_url: screenshotUrl,
    thumbnail_url: thumbnailUrl,
    timestamp: timestamp || null,
    date: screenshot.date || (timestampDay ? timestampDay.format('YYYY-MM-DD') : null),
    time: screenshot.time || (timestampDay ? timestampDay.format('HH:mm:ss') : null),
    size_mb: sizeMb,
    user_email: screenshot.user_email || fallbackEmail || null,
    project_folder: screenshot.subfolder_path || screenshot.project_folder || null,
    activity_type: screenshot.activity_type || 'ACTIVE',
  };
};

export const normalizeScreenshotResponse = (payload, fallbackEmail) => {
  const items = [];
  const seen = new Set();

  const pushRecord = (shot, index = 0) => {
    const record = toScreenshotRecord(shot, fallbackEmail, index);
    if (!record) return;
    if (seen.has(record.id)) return;
    seen.add(record.id);
    items.push(record);
  };

  if (payload?.data?.users && Array.isArray(payload.data.users)) {
    payload.data.users.forEach((user) => {
      const userEmail = user.email || fallbackEmail;
      if (user.grouped_screenshots && typeof user.grouped_screenshots === 'object') {
        Object.values(user.grouped_screenshots).forEach((dayData) => {
          if (Array.isArray(dayData?.screenshots)) {
            dayData.screenshots.forEach((shot, index) => pushRecord(shot, index));
          }
        });
      }
      if (Array.isArray(user.recent_screenshots)) {
        user.recent_screenshots.forEach((shot, index) => pushRecord({ ...shot, user_email: userEmail }, index));
      }
    });
  }

  if (Array.isArray(payload?.data?.screenshots)) {
    payload.data.screenshots.forEach((shot, index) => pushRecord(shot, index));
  }

  items.sort((a, b) => {
    const aTime = a.timestamp ? dayjs(a.timestamp).valueOf() : 0;
    const bTime = b.timestamp ? dayjs(b.timestamp).valueOf() : 0;
    return bTime - aTime;
  });

  const pagination = payload?.data?.pagination;
  const totalScreens = pagination?.total_screenshots ??
    payload?.data?.total_screenshots ??
    items.length;
  const resolvedPage = pagination?.page ?? null;
  const resolvedPerPage = pagination?.page_size ?? pagination?.limit ?? null;

  return {
    items,
    total: totalScreens,
    page: resolvedPage,
    perPage: resolvedPerPage,
  };
};

export const fetchScreenshotsData = async ({ employee, page = 1, perPage = 9, dateRange } = {}) => {
  if (!employee?.email) {
    return {
      items: [],
      total: 0,
      page,
      perPage,
      error: 'Employee email is required to fetch screenshots.',
    };
  }

  const [startDate, endDate] = Array.isArray(dateRange) ? dateRange : [null, null];
  const formattedStart = startDate ? dayjs(startDate).format('YYYY-MM-DD') : null;
  const formattedEnd = endDate
    ? dayjs(endDate).format('YYYY-MM-DD')
    : formattedStart;

  const params = new URLSearchParams({
    q: employee.email || employee.display_name || employee.name || '',
    screenshots_page: String(page),
    screenshots_per_page: String(perPage),
  });

  if (formattedStart) params.set('start_date', formattedStart);
  if (formattedEnd) params.set('end_date', formattedEnd);

  const signal =
    typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(60000)
      : undefined;

  const endpoints = [
    `/api/users/screenshots/?${params.toString()}`,
    `/api/live-tracking/screenshots/?${params.toString()}`
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        ...(signal ? { signal } : {}),
      });

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        continue;
      }

      const payload = await response.json();
      const normalized = normalizeScreenshotResponse(payload, employee.email);

      return {
        ...normalized,
        page: normalized.page ?? page,
        perPage: normalized.perPage ?? perPage,
        error: null,
      };
    } catch (error) {
      lastError = error;
    }
  }

  return {
    items: [],
    total: 0,
    page,
    perPage,
    error: lastError ? lastError.message : 'Unable to fetch screenshots.',
  };
};


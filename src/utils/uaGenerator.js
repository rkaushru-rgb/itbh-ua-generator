const crypto = require('crypto');

const UA_DATA = {
  windows: {
    label: 'Windows',
    versions: ['10.0', '11.0', '6.3', '6.1'],
    archs: ['Win64; x64', 'WOW64', 'Win32']
  },
  macos: {
    label: 'macOS',
    versions: ['14_5', '13_6', '12_7', '11_7', '10_15_7'],
    archs: ['Intel Mac OS X', 'Apple Silicon']
  },
  linux: {
    label: 'Linux',
    distros: ['Ubuntu', 'Fedora', 'Debian', 'Arch'],
    archs: ['x86_64', 'aarch64', 'i686']
  },
  android: {
    label: 'Android',
    versions: ['14', '13', '12', '11', '10', '9'],
    models: [
      'Samsung Galaxy S24 Ultra', 'Samsung Galaxy S23', 'Samsung Galaxy A54',
      'Google Pixel 8 Pro', 'Google Pixel 7', 'Google Pixel 6a',
      'OnePlus 12', 'OnePlus 11', 'Xiaomi 14 Pro', 'Xiaomi 13T',
      'OPPO Find X7', 'Realme GT5', 'Vivo X100 Pro',
      'Motorola Edge 50', 'Nothing Phone 2', 'ASUS ROG Phone 8'
    ]
  },
  ios: {
    label: 'iOS',
    versions: ['17_5', '17_4', '17_3', '16_7', '15_8'],
    models: [
      'iPhone16,2', 'iPhone16,1', 'iPhone15,3', 'iPhone15,2',
      'iPhone14,3', 'iPhone14,2', 'iPhone13,4', 'iPhone12,8'
    ]
  },
  chromeos: {
    label: 'ChromeOS',
    versions: ['124.0.6367.82', '123.0.6312.105', '122.0.6261.128'],
    archs: ['x86_64', 'aarch64']
  }
};

const BROWSER_DATA = {
  chrome: {
    label: 'Chrome',
    versions: ['125.0.6422.142', '124.0.6367.208', '123.0.6312.122',
               '122.0.6261.128', '121.0.6167.184', '120.0.6099.216']
  },
  firefox: {
    label: 'Firefox',
    versions: ['126.0', '125.0.1', '124.0', '123.0', '122.0', '121.0']
  },
  safari: {
    label: 'Safari',
    versions: ['17.5', '17.4.1', '17.3.1', '16.6.1', '15.6.1']
  },
  edge: {
    label: 'Edge',
    versions: ['125.0.2535.92', '124.0.2478.109', '123.0.2420.97',
               '122.0.2365.92', '121.0.2277.128']
  },
  opera: {
    label: 'Opera',
    versions: ['110.0.5130.39', '109.0.5097.68', '108.0.5067.30',
               '107.0.5045.36', '106.0.4998.70']
  },
  samsung: {
    label: 'Samsung Browser',
    versions: ['24.0', '23.0', '22.0', '21.0', '20.0', '19.0']
  },
  tiktok: {
    label: 'TikTok In-App',
    versions: ['36.2.4', '35.8.3', '34.6.5', '33.5.2', '32.4.1']
  }
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickVersion(versions, customVersions) {
  if (customVersions && customVersions.length > 0) return pick(customVersions);
  return pick(versions);
}

function buildChromeUA(platform, chromeVer) {
  const webkit = '537.36';
  return `Mozilla/5.0 (${platform}) AppleWebKit/${webkit} (KHTML, like Gecko) Chrome/${chromeVer} Safari/${webkit}`;
}

function generateSingleUA(opts) {
  const { device, osKey, osVersion, browserKey, browserVersion } = opts;
  const osData = UA_DATA[osKey];
  const brData = BROWSER_DATA[browserKey];
  const chromeData = BROWSER_DATA.chrome;

  let platform = '';
  let os = osKey;

  if (osKey === 'windows') {
    const arch = pick(osData.archs);
    const ver = osVersion || pick(osData.versions);
    platform = `Windows NT ${ver}; ${arch}`;
  } else if (osKey === 'macos') {
    const ver = osVersion || pick(osData.versions);
    platform = `Macintosh; Intel Mac OS X ${ver}`;
  } else if (osKey === 'linux') {
    const arch = pick(osData.archs);
    platform = `X11; Linux ${arch}`;
  } else if (osKey === 'android') {
    const ver = osVersion || pick(osData.versions);
    const model = pick(osData.models);
    platform = `Linux; Android ${ver}; ${model}`;
  } else if (osKey === 'ios') {
    const ver = osVersion || pick(osData.versions);
    const model = pick(osData.models);
    platform = `${model}; CPU iPhone OS ${ver} like Mac OS X`;
  } else if (osKey === 'chromeos') {
    const arch = pick(osData.archs);
    const ver = osVersion || pick(osData.versions);
    platform = `X11; CrOS ${arch} ${ver}`;
  }

  const bVer = browserVersion || pick(brData.versions);

  let ua = '';

  if (browserKey === 'chrome') {
    ua = buildChromeUA(platform, bVer);
  } else if (browserKey === 'firefox') {
    const geckoDate = '20100101';
    ua = `Mozilla/5.0 (${platform}; rv:${bVer}) Gecko/${geckoDate} Firefox/${bVer}`;
  } else if (browserKey === 'safari') {
    const webkit = '605.1.15';
    ua = `Mozilla/5.0 (${platform}) AppleWebKit/${webkit} (KHTML, like Gecko) Version/${bVer} Safari/${webkit}`;
  } else if (browserKey === 'edge') {
    const chromeVer = pick(chromeData.versions);
    const webkit = '537.36';
    ua = `Mozilla/5.0 (${platform}) AppleWebKit/${webkit} (KHTML, like Gecko) Chrome/${chromeVer} Safari/${webkit} Edg/${bVer}`;
  } else if (browserKey === 'opera') {
    const chromeVer = pick(chromeData.versions);
    const webkit = '537.36';
    ua = `Mozilla/5.0 (${platform}) AppleWebKit/${webkit} (KHTML, like Gecko) Chrome/${chromeVer} Safari/${webkit} OPR/${bVer}`;
  } else if (browserKey === 'samsung') {
    const chromeVer = pick(chromeData.versions);
    const webkit = '537.36';
    ua = `Mozilla/5.0 (${platform}) AppleWebKit/${webkit} (KHTML, like Gecko) SamsungBrowser/${bVer} Chrome/${chromeVer} Mobile Safari/${webkit}`;
  } else if (browserKey === 'tiktok') {
    const chromeVer = pick(chromeData.versions);
    const webkit = '537.36';
    ua = `Mozilla/5.0 (${platform}) AppleWebKit/${webkit} (KHTML, like Gecko) Chrome/${chromeVer} Mobile Safari/${webkit} musical_ly/${bVer} TikTok/${bVer}`;
  }

  const hash = crypto.createHash('sha256').update(ua).digest('hex');

  return {
    ua_string: ua,
    ua_hash: hash,
    device_type: device,
    os_name: osData ? osData.label : osKey,
    os_version: osVersion || '',
    browser_name: brData ? brData.label : browserKey,
    browser_version: bVer
  };
}

function generateBatch(opts, count, existingHashes) {
  const results = [];
  const seen = new Set(existingHashes || []);
  let attempts = 0;
  const maxAttempts = count * 50;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;
    const single = generateSingleUA(opts);
    if (!seen.has(single.ua_hash)) {
      seen.add(single.ua_hash);
      results.push(single);
    }
  }

  return results;
}

module.exports = { generateBatch, generateSingleUA, UA_DATA, BROWSER_DATA };

import { useMemo } from 'react';

export default (t) => useMemo(() => ({
  latitude: {
    name: t('positionLatitude'),
    type: 'number',
    property: true,
  },
  longitude: {
    name: t('positionLongitude'),
    type: 'number',
    property: true,
  },
  speed: {
    name: t('positionSpeed'),
    type: 'number',
    dataType: 'speed',
    property: true,
  },
  course: {
    name: t('positionCourse'),
    type: 'number',
    property: true,
  },
  altitude: {
    name: t('positionAltitude'),
    type: 'number',
    property: true,
  },
  accuracy: {
    name: t('positionAccuracy'),
    type: 'number',
    dataType: 'distance',
    property: true,
  },
  valid: {
    name: t('positionValid'),
    type: 'boolean',
    property: true,
  },
  address: {
    name: t('positionAddress'),
    type: 'string',
    property: true,
  },
  deviceTime: {
    name: t('positionDeviceTime'),
    type: 'string',
    property: true,
  },
  fixTime: {
    name: t('positionFixTime'),
    type: 'string',
    property: true,
  },
  serverTime: {
    name: t('positionServerTime'),
    type: 'string',
    property: true,
  },
  geofenceIds: {
    name: t('sharedGeofences'),
    property: true,
  },
  sat: {
    name: t('positionSat'),
    type: 'number',
  },
  batteryLevel: {
    name: t('positionBatteryLevel'),
    type: 'number',
    dataType: 'percentage',
  },
  totalDistance: {
    name: t('deviceTotalDistance'),
    type: 'number',
    dataType: 'distance',
  },
  geofence: {
    name: t('sharedGeofence'),
    type: 'string',
  },
}), [t]);

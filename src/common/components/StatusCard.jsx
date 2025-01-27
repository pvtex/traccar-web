import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import Draggable from 'react-draggable';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
  TableFooter,
  Link,
  Tooltip,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Route';
import PublishIcon from '@mui/icons-material/Publish';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingIcon from '@mui/icons-material/Pending';
import LiveModeIcon from '@mui/icons-material/Streetview';
import LightIcon from '@mui/icons-material/Flare';
import BuzzerIcon from '@mui/icons-material/VolumeUp';

import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useDeviceReadonly, useAdministrator } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';

const useStyles = makeStyles((theme) => ({
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  mediaButton: {
    color: theme.palette.primary.contrastText,
    mixBlendMode: 'normal',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 0, 2),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
    '& .MuiTableCell-sizeSmall:first-child': {
      paddingRight: theme.spacing(1),
    },
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-between',
  },
  root: ({ desktopPadding }) => ({
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  }),
}));

const StatusRow = ({ name, content }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.cell}>
        <Typography variant="body2">{name}</Typography>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">{content}</Typography>
      </TableCell>
    </TableRow>
  );
};

const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const admin = useAdministrator();
  const deviceReadonly = useDeviceReadonly();

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'fixTime,address,speed,totalDistance,valid,batteryLevel');

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch('/api/devices');
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetch('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);

  const livemodehandle = useCatch(async () => {
    // livemode
    fetch('/api/commands/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: `{"id":22,"attributes":{},"deviceId":${deviceId},"type":"liveModeOn","textChannel":false,"description":"LiveMode"}`,
    });
  });
  const buzzerhandle = useCatch(async () => {
    // buzzer
    fetch('/api/commands/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: `{"id":7,"attributes":{},"deviceId":${deviceId},"type":"buzzerOn","textChannel":false,"description":"Buzzer An"}`,
    });
  });
  const lighthandle = useCatch(async () => {
    // light
    fetch('/api/commands/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: `{"id":9,"attributes":{},"deviceId":${deviceId},"type":"lightOn","textChannel":false,"description":"Licht An"}`,
    });
  });

  const [lmd, setLmd] = useState(null);
  useEffect(() => {
    async function getLmd() {
      let livemodedis = true;
      const deviceurl = `/api/devices/?id=${deviceId}`;
      const lmc = await fetch(deviceurl);
      let lmcres = '';
      if (lmc.ok) {
        lmcres = await lmc.text();
        if (lmcres.indexOf('"liveModetime":null') > -1) {
          livemodedis = false;
        } else {
          livemodedis = true;
        }
      } else {
        livemodedis = true;
        setLmd(livemodedis);
        throw Error('Can not get LiveMode Status');
      }
      if (!position) { livemodedis = true; }
      setLmd(livemodedis);
    }
    getLmd();
  }, [deviceId]);

  const [lmcolor, setLmcolor] = useState(null);
  useEffect(() => {
    function getLmcolor() {
      let col = {};
      if (position && lmd) {
        col = {
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            color: '#00FF0080',
          },
        };
      }
      setLmcolor(col);
    }
    getLmcolor();
  }, [deviceId]);

  const [lightd, setLightd] = useState(null);
  useEffect(() => {
    async function getLightd() {
      let lightdis = true;
      const deviceurl = `/api/commands/send/?deviceId=${deviceId}`;
      const lightc = await fetch(deviceurl);
      let lightdres = '';
      if (lightc.ok) {
        lightdres = await lightc.text();
        if (lightdres.indexOf('"type":"lightOn"') > -1) {
          lightdis = false;
        } else {
          lightdis = true;
        }
      } else {
        lightdis = true;
        setLightd(lightdis);
        throw Error('Can not get SearchLight Status');
      }
      if (!position) { lightdis = true; }
      setLightd(lightdis);
    }
    getLightd();
  }, [deviceId]);

  const [buzzerd, setBuzzerd] = useState(null);
  useEffect(() => {
    async function getBuzzerd() {
      let buzzerdis = true;
      const deviceurl = `/api/commands/send/?deviceId=${deviceId}`;
      const buzzerc = await fetch(deviceurl);
      let buzzerdres = '';
      if (buzzerc.ok) {
        buzzerdres = await buzzerc.text();
        if (buzzerdres.indexOf('"type":"buzzerOn"') > -1) {
          buzzerdis = false;
        } else {
          buzzerdis = true;
        }
      } else {
        buzzerdis = true;
        setLightd(buzzerdis);
        throw Error('Can not get SearchSound Status');
      }
      if (!position) { buzzerdis = true; }
      setBuzzerd(buzzerdis);
    }
    getBuzzerd();
  }, [deviceId]);

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Draggable
            handle={`.${classes.media}, .${classes.header}`}
          >
            <Card elevation={3} className={classes.card}>
              {deviceImage ? (
                <CardMedia
                  className={classes.media}
                  image={`/api/media/${device.uniqueId}/${deviceImage}`}
                >
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" className={classes.mediaButton} />
                  </IconButton>
                </CardMedia>
              ) : (
                <div className={classes.header}>
                  <Typography variant="body2" color="textSecondary">
                    {device.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              )}
              {position && (
                <CardContent className={classes.content}>
                  <Table size="small" classes={{ root: classes.table }}>
                    <TableBody>
                      {positionItems.split(',').filter((key) => position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key)).map((key) => (
                        <StatusRow
                          key={key}
                          name={positionAttributes[key]?.name || key}
                          content={(
                            <PositionValue
                              position={position}
                              property={position.hasOwnProperty(key) ? key : null}
                              attribute={position.hasOwnProperty(key) ? null : key}
                            />
                          )}
                        />
                      ))}

                    </TableBody>
                    {admin && (
                      <TableFooter>
                        <TableRow>
                          <TableCell colSpan={2} className={classes.cell}>
                            <Typography variant="body2">
                              <Link component={RouterLink} to={`/position/${position.id}`}>{t('sharedShowDetails')}</Link>
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableFooter>
                    )}
                  </Table>
                </CardContent>
              )}
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <Tooltip title={t('sharedExtra')}>
                  <IconButton
                    color="secondary"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    disabled={!position}
                  >
                    <PendingIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('liveModeActivate')}>
                  <IconButton
                    onClick={() => livemodehandle()}
                    disabled={lmd}
                    sx={lmcolor}
                  >
                    <LiveModeIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('lightActivate')}>
                  <IconButton
                    onClick={() => lighthandle()}
                    disabled={lightd}
                  >
                    <LightIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('buzzerActivate')}>
                  <IconButton
                    onClick={() => buzzerhandle()}
                    disabled={buzzerd}
                  >
                    <BuzzerIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('reportReplay')}>
                  <IconButton
                    onClick={() => navigate('/replay')}
                    disabled={disableActions || !position}
                  >
                    <ReplayIcon />
                  </IconButton>
                </Tooltip>
                {admin && (
                <Tooltip title={t('commandTitle')}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                    disabled={disableActions}
                  >
                    <PublishIcon />
                  </IconButton>
                </Tooltip>
                )}
                <Tooltip title={t('sharedEdit')}>
                  <IconButton
                    onClick={() => navigate(`/settings/device/${deviceId}`)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                {admin && (
                <Tooltip title={t('sharedRemove')}>
                  <IconButton
                    color="error"
                    onClick={() => setRemoving(true)}
                    disabled={disableActions || deviceReadonly}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                )}
              </CardActions>
            </Card>
          </Draggable>
        )}
      </div>
      {position && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={handleGeofence}>{t('sharedCreateGeofence')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}>{t('linkGoogleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}>{t('linkAppleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}>{t('linkStreetView')}</MenuItem>
          {navigationAppTitle && <MenuItem component="a" target="_blank" href={navigationAppLink.replace('{latitude}', position.latitude).replace('{longitude}', position.longitude)}>{navigationAppTitle}</MenuItem>}
          {!shareDisabled && !user.temporary && (
            <MenuItem onClick={() => navigate(`/settings/device/${deviceId}/share`)}><Typography color="secondary">{t('deviceShare')}</Typography></MenuItem>
          )}
        </Menu>
      )}
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default StatusCard;

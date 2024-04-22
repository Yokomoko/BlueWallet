import React from 'react';
// @ts-ignore: react-native-handoff is not in the type definition
import Handoff from 'react-native-handoff';
import { useSettings } from './Context/SettingsContext';

interface HandOffComponentProps {
  url?: string;
  title?: string;
  type: (typeof HandOffComponent.activityTypes)[keyof typeof HandOffComponent.activityTypes];
  userInfo?: object;
}

interface HandOffComponentWithActivityTypes extends React.FC<HandOffComponentProps> {
  activityTypes: {
    ReceiveOnchain: string;
    Xpub: string;
    ViewInBlockExplorer: string;
  };
}

const HandOffComponent: HandOffComponentWithActivityTypes = props => {
  const { isHandOffUseEnabled } = useSettings();

  if (process.env.NODE_ENV === 'development') {
    console.log('HandOffComponent: props', props);
  }
  if (isHandOffUseEnabled) {
    return <Handoff {...props} />;
  }
  return null;
};

const activityTypes = {
  ReceiveOnchain: 'org.groestlcoin.bluewallet123.receiveonchain',
  Xpub: 'org.groestlcoin.bluewallet123.xpub',
  ViewInBlockExplorer: 'org.groestlcoin.bluewallet123.blockexplorer',
};

HandOffComponent.activityTypes = activityTypes;

export default HandOffComponent;

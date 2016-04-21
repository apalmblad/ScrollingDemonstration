'use strict';

/**
 *  Provides two methods: subscribe and unsubscribe to listen for changes to the keyboard height.
 *
 *  When a keyboard event is received, this will iterate from the most recent listener to the least
 *  recent, giving each a chance to 'handle' the keyboard event. If any of the listeners return true,
 *  the event processing will stop. This is mostly so that if a popup is rendered on top of a form,
 *  the popup will move while the form stays stationary in the background.
 *
 *  NOTE: Android does not support willShow and willHide keyboard events so the less responsive
 *  didShow and didHide are used instead. Hopefully these events are supported on Android in the future.
 */

import { DeviceEventEmitter, Platform } from 'react-native';

let uniqueId = 1;
const listeners = [];

const isAndroid = Platform.OS === 'android';
const ADD_ACTION = isAndroid ? 'keyboardDidShow' : 'keyboardWillShow';
const HIDE_ACTION = isAndroid ? 'keyboardDidHide' : 'keyboardWillHide';

let currentHeight = 0;

DeviceEventEmitter.addListener( ADD_ACTION, onKeyboardShow );
// ----------------------------------------------------- function onKeyboardShow
function onKeyboardShow( keyboardShowEvent )
{
  currentHeight = keyboardShowEvent.endCoordinates.height;

  for ( let i = listeners.length - 1; i >= 0; i-- )
  {
    const listener = listeners[i].listener;
    const listenerDidHandle = listener( currentHeight, keyboardShowEvent.duration || 0 );
    if ( listenerDidHandle )
    {
      return;
    }
  }
}
DeviceEventEmitter.addListener( HIDE_ACTION, onKeyboardHide );
// -------------------------------------------------------------- onKeyboardHide
function onKeyboardHide( keyboardHideEvent )
{
  currentHeight = 0;

  for ( let i = listeners.length - 1; i >= 0; i-- )
  {
    const listener = listeners[i].listener;
    const listenerDidHandle = listener( currentHeight, keyboardHideEvent ? keyboardHideEvent.duration : 0 );
    if ( listenerDidHandle )
    {
      return;
    }
  }
}

// ---------------------------------------------------- getCurrentKeyboardHeight
export function getCurrentKeyboardHeight()
{
  return currentHeight;
}

// ------------------------------------------------------------------- subscribe
export function subscribe( listener )
{
  if ( typeof listener === 'function' )
  {
    const listenerId = uniqueId++;
    listeners.push( { key: listenerId, listener: listener } );
    return listenerId;
  }
  else
  {
    console.error( 'Invalid listener type', listener );
    return -1;
  }
}

// ----------------------------------------------------------------- unsubscribe
export function unsubscribe( listenerId )
{
  const idx = listeners.findIndex( listener => listener.key === listenerId );
  if ( idx > -1 )
  {
    listeners.splice( idx, 1 );
  }
  else
  {
    console.error( 'Invalid listener ID', listenerId );
  }
}

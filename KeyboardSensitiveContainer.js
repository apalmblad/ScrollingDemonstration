'use strict';

import React, {
  Animated,
  Component,
  Platform,
  View,
} from 'react-native';

import dismissKeyboard from 'dismissKeyboard';

import * as KeyboardState from './KeyboardState';

const A_SMALL_NUMBER = 0.00001;
const isIOS = Platform.OS === 'ios';

// the behaviour I am currently using
// const SHOULD_ANIMATE_CONTAINER = isIOS;

// set this to investigate the behaviour when animating and not
const SHOULD_ANIMATE_CONTAINER = false;

export default class KeyboardSensitiveContainer extends Component
{
  // --------------------------------------------------------------- constructor
  constructor( props )
  {
    super( props );

    const currentKeyboardHeight = KeyboardState.getCurrentKeyboardHeight();

    // override a 0 keyboard height with A_SMALL_NUMBER since 0 height means unbounded height
    let initalOffset = A_SMALL_NUMBER;

    if ( isIOS && currentKeyboardHeight )
    {
      initalOffset = currentKeyboardHeight;
    }

    this.state =
    {
      offset: new Animated.Value( initalOffset ),
    };
  }

  // --------------------------------------------------------- componentDidMount
  componentDidMount()
  {
    if ( !this.props.externallyControlled )
    {
      this.listenerId = KeyboardState.subscribe( this.onKeyboardChange.bind( this ) );
    }
  }

  // ---------------------------------------------------------- onKeyboardChange
  onKeyboardChange( keyboardHeight, duration )
  {
    if ( SHOULD_ANIMATE_CONTAINER )
    {
      Animated.timing(
        this.state.offset,
        {
          duration,
          toValue: keyboardHeight || A_SMALL_NUMBER,
        }
      ).start();
    }
    
    return true;
  }

  // ------------------------------------------------------ componentWillUnmount
  componentWillUnmount()
  {
    if ( this.listenerId )
    {
      KeyboardState.unsubscribe( this.listenerId );
    }
  }

  // -------------------------------------------------------------------- render
  render()
  {
    const {
      children,
      ...viewProps,
    } = this.props;

    return (
      <View { ...viewProps }>
        { children }
        <Animated.View
          onStartShouldSetResponder={ dismissKeyboard }
          style={{ height: this.state.offset }}
        />
      </View>
    );
  }
}

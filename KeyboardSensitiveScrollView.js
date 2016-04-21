'use strict';

import React, {
  Component,
  Dimensions,
  ScrollView,
} from 'react-native';

import KeyboardSensitiveContainer from './KeyboardSensitiveContainer';
import * as KeyboardState from './KeyboardState';

// set this to investigate the behaviour when using the KeyboardSenstiveScrollView or not
const SHOULD_SCROLL_INTO_FOCUS = true;

class KeyboardSensitiveScrollView extends Component
{
  // --------------------------------------------------------------- constructor
  constructor( props )
  {
    super( props );

    this.inputFocused = this.inputFocused.bind( this );

    this.keyboardIsOpen = KeyboardState.getCurrentKeyboardHeight() > 0;
    this.listenerId = KeyboardState.subscribe( this.onKeyboardChange.bind( this ) );
  }

  // ------------------------------------------------------ componeneWillUnmount
  componentWillUnmount()
  {
    KeyboardState.unsubscribe( this.listenerId );
    if ( this.timeoutId )
    {
      clearTimeout( this.timeoutId );
    }
    this._scroll = null;
    this.requestedScroll = null;
  }

  // -------------------------------------------------------------- inputFocused
  inputFocused( focusEvent )
  {
    if ( !SHOULD_SCROLL_INTO_FOCUS )
    {
      return;
    }

    // base offset is the difference between the top of the screen and the top of the ScrollView
    let offset = this.offset;
    if ( focusEvent.offset )
    {
      // for things like picker heights
      offset += focusEvent.offset;
    }

    if ( focusEvent && focusEvent.currentTarget )
    {
      const scrollData =
      {
        offset: offset,
        target: focusEvent.currentTarget,
      };

      if ( focusEvent.isNotTextInput )
      {
        this.scrollTargetIntoFocus( scrollData );
      }
      else if ( !focusEvent.isNotTextInput && this.keyboardIsOpen )
      {
        this.scrollTargetIntoFocus( scrollData );
      }
      else
      {
        this.requestedScroll = scrollData;
        this.timeoutId = setTimeout(
          () =>
          {
            this.scrollTargetIntoFocus( scrollData );
          },
          750
        );
      }
    }
  }

  // ---------------------------------------------------------- onKeyboardChange
  onKeyboardChange( keyboardHeight, duration )
  {
    const keyboardwillBeOpen = keyboardHeight > 0;

    if ( !this.keyboardIsOpen && keyboardwillBeOpen && this.requestedScroll )
    {
      this.scrollTargetIntoFocus( this.requestedScroll );
    }

    this.keyboardIsOpen = keyboardwillBeOpen;

    this.refs.containerPadding && this.refs.containerPadding.onKeyboardChange( keyboardHeight, duration );
    
    return true;
  }

  // ----------------------------------------------------- scrollTargetIntoFocus
  scrollTargetIntoFocus( { target, offset } )
  {
    const scrollResponder = this._scroll && this._scroll.getScrollResponder();
    if ( scrollResponder )
    {
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        target,
        offset,
        true // prevent the scrollview from scrolling negatively
      );

      if ( this.timeoutId )
      {
        clearTimeout( this.timeoutId );
      }
      this.requestedScroll = null;
    }
    else
    {
      this.requestedScroll = { target, offset };
    }
  }

  // ----------------------------------------------------------- calculateOffset
  calculateOffset( { nativeEvent } )
  {
    this.offset = Dimensions.get( 'window' ).height - nativeEvent.layout.height;
  }

  // ------------------------------------------------------------- onScrollReady
  onScrollReady( scroll )
  {
    if ( scroll )
    {
      this._scroll = scroll;
      if ( this.requestedScroll )
      {
        this.scrollTargetIntoFocus( this.requestedScroll );
      }
    }
  }

  // -------------------------------------------------------------------- render
  render()
  {
    const {
      children,
      ...scrollViewProps,
    } = this.props;

    return (
      <ScrollView { ...scrollViewProps }
        ref={ this.onScrollReady.bind( this ) }
        onLayout={ this.calculateOffset.bind( this ) }>
        <KeyboardSensitiveContainer
          ref="containerPadding"
          externallyControlled={ true }>
          { children }
        </KeyboardSensitiveContainer>
      </ScrollView>
    );
  }
}

KeyboardSensitiveScrollView.defaultProps =
{
  alwaysBounceVertical: false,
  style: { flex: 1 },
};

KeyboardSensitiveScrollView.propTypes = ScrollView.propTypes;

export default KeyboardSensitiveScrollView;

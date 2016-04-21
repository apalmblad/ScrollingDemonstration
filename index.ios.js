/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {
  AppRegistry,
  Component,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import KeyboardSensitiveScrollView from './KeyboardSensitiveScrollView';
import Picker from './Picker';

const optionString = "These are a bunch of example picker options. Don't worry about actually selecting them";

const options = optionString.split( ' ' )
                            .map( ( text, index ) => (
                              {
                                label: text,
                                value: index,
                                key: index,
                              } )
                            );

const SHOULD_ALWAYS_BOUNCE_VERTICALLY = false;
const SHOULD_CONTENT_EXPAND_PAST_SCREEN = false;
const SHOULD_SHOW_PICKER = false;
const SHOULD_SHOW_INPUT = true;

class ScrollingDemonstration extends Component
{
  inputFocused( event )
  {
    this.refs.scrollView && this.refs.scrollView.inputFocused( event );
  }

  render()
  {
    return (
      <View style={ styles.container }>
        <KeyboardSensitiveScrollView
          ref="scrollView"
          alwaysBounceVertical={ SHOULD_ALWAYS_BOUNCE_VERTICALLY }>
          <Text>This is some content at the top</Text>
          <View style={ styles.topSpacing }/>
          {
            SHOULD_SHOW_PICKER ?
              <Picker
                options={ options }
                onPress={ this.inputFocused.bind( this ) }
              />
            : null
          }
          {
            SHOULD_SHOW_INPUT ?
              <TextInput
                placeholder="Focus Me"
                onFocus={ this.inputFocused.bind( this ) }
                style={ styles.input } 
              />
            : null
          }
          {
            SHOULD_CONTENT_EXPAND_PAST_SCREEN ?
              <View style={ styles.bottomSpacing }/>
            : null
          }
        </KeyboardSensitiveScrollView>
      </View>
    );
  }
}

const deviceHeight = Dimensions.get( 'window' ).height

let calculatedTopHeight = deviceHeight;
if ( SHOULD_SHOW_PICKER )
{
  calculatedTopHeight -= 80;
}
if ( SHOULD_SHOW_INPUT )
{
  calculatedTopHeight -= 80;
}

const styles = StyleSheet.create(
{
  container:
  {
    flex: 1,
    marginTop: 20,
  },
  input:
  {
    height: 40,
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  topSpacing:
  {
    height: calculatedTopHeight,
  },
  bottomSpacing:
  {
    height: deviceHeight / 2,
  },
} );

AppRegistry.registerComponent('ScrollingDemonstration', () => ScrollingDemonstration);

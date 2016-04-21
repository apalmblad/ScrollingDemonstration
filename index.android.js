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

const SHOULD_CONTENT_EXPAND_PAST_SCREEN = false;

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
        <KeyboardSensitiveScrollView ref="scrollView">
          <Text>This is some content at the top</Text>
          <View style={ styles.topSpacing }/>
          <TextInput
            placeholder="Focus Me"
            onFocus={ this.inputFocused.bind( this ) }
            style={ styles.input } 
          />
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


const styles = StyleSheet.create(
{
  container:
  {
    flex: 1,
    marginTop: 10,
  },
  input:
  {
    height: 40,
    borderBottomWidth: 1,
    borderColor: 'black',
  },
  topSpacing:
  {
    height: deviceHeight - 90,
  },
  bottomSpacing:
  {
    height: deviceHeight / 2,
  },
} );

AppRegistry.registerComponent('ScrollingDemonstration', () => ScrollingDemonstration);

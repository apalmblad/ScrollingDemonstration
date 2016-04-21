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

import dismissKeyboard from 'dismissKeyboard';

import KeyboardSensitiveContainer from './KeyboardSensitiveContainer';

class ScrollingDemonstration extends Component
{
  render()
  {
    return (
      <View
        onStartShouldSetResponder={ dismissKeyboard }
        style={ styles.container }>
        <TextInput
          placeholder="Focus Me"
          style={ styles.input }
        />
        <View style={ styles.innerContainer }>
          <KeyboardSensitiveContainer>
            <View style={ styles.jumpiness }/>
            <TextInput
              placeholder="Or Focus Me"
              style={ styles.input }
            />
          </KeyboardSensitiveContainer>
        </View>
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
    backgroundColor: 'white',
  },
  innerContainer:
  {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'flex-end',
  },
  input:
  {
    height: 40,
    borderBottomWidth: 1,
    backgroundColor: 'white',
    borderColor: 'black',
  },
  topSpacing:
  {
    height: deviceHeight - 200,
  },
  jumpiness:
  {
    height: 50,
    width: 50,
    alignSelf: 'flex-end',
    backgroundColor: 'red',
  },
  bottomSpacing:
  {
    height: deviceHeight / 2,
  },
} );

AppRegistry.registerComponent('ScrollingDemonstration', () => ScrollingDemonstration);

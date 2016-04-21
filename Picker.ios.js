'use strict';

import React, {
  Component,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ToggleablePicker from './ToggleablePicker';

const PICKER_HEIGHT = 200;

class Picker extends Component
{
  state = { open: false };

  render()
  {
    return (
      <View style={{ paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'grey' }}>
        <TouchableOpacity
          onPress={ touchEvent =>
          {
            if ( typeof this.props.onPress === 'function' )
            {
              touchEvent.isNotTextInput = true;
              touchEvent.offset = this.state.open ? 0 : PICKER_HEIGHT;
              this.props.onPress( touchEvent );
            }
            this.setState( { open: !this.state.open } )
          } }
          activeOpacity={ 0.4 }>
          <Text>
            Press Me To { this.state.open ? 'Close' : 'Open' } Picker
          </Text>
          <ToggleablePicker
            open={ this.state.open }
            height={ PICKER_HEIGHT }
            options={ this.props.options }
          />
        </TouchableOpacity>
      </View>
    );
  }
}

export default Picker;

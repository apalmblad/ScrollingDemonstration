'use strict';

import React, {
  Animated,
  Component,
  Picker,
  PropTypes,
  View,
} from 'react-native';

const PickerItem = Picker.Item;

const A_SMALL_NUMBER = 0.000000001;

////////////////////////////////////////////////////////////////////////////////
//
// ToggleablePicker
//
////////////////////////////////////////////////////////////////////////////////

class ToggleablePicker extends Component
{
  constructor( props )
  {
    super( props );

    const value = new Animated.Value(
      this.props.open ?
        this.props.height
      : A_SMALL_NUMBER
    );

    this.state = { value };
  }

  // ------------------------------------------------- componentWillReceiveProps
  componentWillReceiveProps( nextProps )
  {
    if ( nextProps.open !== this.props.open )
    {
      Animated.timing(
        this.state.value,
        {
          toValue: nextProps.open ?
            this.props.height
          : A_SMALL_NUMBER,
          duration: this.props.duration,
        },
      ).start();
    }
  }

  // -------------------------------------------------------------------- picker
  picker()
  {
    return (
      <Picker
        selectedValue={ 0 }
        onValueChange={ () => null }>
        {
          this.props.options.map( itemProps => <PickerItem { ...itemProps }/> )
        }
      </Picker>
    );
  }

  // -------------------------------------------------------------------- render
  render()
  {
    return (
      <Animated.View
        onStartShouldSetResponder={ () => true }
        style={{
          opacity: this.state.value.interpolate(
          {
            inputRange: [ A_SMALL_NUMBER, this.props.height * 0.25, this.props.height ],
            outputRange: [ 0, 0, 1 ],
          } ),
          flex: 1,
          height: this.state.value,
        }}>
        { this.picker() }
      </Animated.View>
    );
  }
}

ToggleablePicker.propTypes =
{
  open: PropTypes.bool.isRequired,
  picker: PropTypes.oneOfType(
  [
    PropTypes.func,
    PropTypes.node,
  ] ),
  height: PropTypes.number,
  duration: PropTypes.number,
};

ToggleablePicker.defaultProps =
{
  height: 200,
  duration: 500,
};

export default ToggleablePicker;

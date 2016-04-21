  One issue when creating forms for use on a mobile device is handling scrolling to elements such that their content is visible on the screen in response to a focus or touch event while also considering if they keyboard will cover the content as well.

e.g.
You have an iOS picker that animates in response to pressing on the displayed content  
![Image:](http://i.imgur.com/JXFdmcO.gif)  
taken on iOS with SHOULD_SCROLL_INTO_FOCUS = false
  
You have a text input that may get covered by the keyboard when it opens  
![Image:](http://i.imgur.com/mzRYhex.gif)  
taken on iOS with SHOULD_ANIMATE_CONTAINER = false and SHOULD_SCROLL_INTO_FOCUS = false
  
For reference, here's what I think *should* happen in each of these cases  
![Image:](http://i.imgur.com/AagcyP0.gif)
  
taken on iOS with SHOULD_SCROLL_INTO_FOCUS = true
  
![Image:](http://i.imgur.com/4YQ1sYA.gif)
  
taken on iOS with SHOULD_ANIMATE_CONTAINER = true and SHOULD_SCROLL_INTO_FOCUS = true
  
This is a very common problem and I was surprised to not see more discussion about it. I will present my solution and the challenges faced in creating it, but the real purpose of this is to see what others have done to solve this and other, similar, issues to see if there is an easier way or if it can be made easier for developers in the future.
  
I began by researching what others have done to solve this problem and came across the following:
https://github.com/APSL/react-native-keyboard-aware-scroll-view
  
I didn't want to introduce another dependency to my project as I was very close to releasing our app on iOS; however, that component did lead me to the `scrollResponderScrollNativeHandleToKeyboard` method defined in react-native/Libraries/Components/ScrollResponder.js which formed the basis of my solution.
  
For the uninitiated, here is the jsdoc-style definition
````
/**
 * This method should be used as the callback to onFocus in a TextInputs'
 * parent view. Note that any module using this mixin needs to return
 * the parent view's ref in getScrollViewRef() in order to use this method.
 * @param {any} nodeHandle The TextInput node handle
 * @param {number} additionalOffset The scroll view's top "contentInset".
 *        Default is 0.
 * @param {bool} preventNegativeScrolling Whether to allow pulling the content
 *        down to make it meet the keyboard's top. Default is false.
 */
````

Don't worry about it specifying the nodeHandle as needing to be for a TextInput, the handle can be for any type of React Element!  
Something that initially caused some confusion is the wording on additionalOffset which implied that I should be recording the top edge of whatever ScrollResponder I was using and passing that in as the additionalOffset; however, in reading a bit further I found:
  
````
/**
 * The calculations performed here assume the scroll view takes up the entire
 * screen - even if has some content inset. We then measure the offsets of the
 * keyboard, and compensate both for the scroll view's "contentInset".
 *
````
  
which made me realize what I really wanted was the difference between the device's height [retrived from Dimensions.get('window').height] and the height of the ScrollView itself (retrieved in the onLayout callback).
  
But... There was another issue. As it turns out, when a ScrollResponders scrolls to a desired position, if that position requires more scrolling space than the ScrollView has in the first place, it will add some offset to the bottom (or top if `preventNegativeScrolling` was passed in as false) to reach the desired position. This meant that on some of my scrolling pages, views were getting stuck:
  
![Image:](http://i.imgur.com/0wktH3p.gif)  
taken on iOS with SHOULD_ANIMATE_CONTAINER = false and SHOULD_SCROLL_INTO_FOCUS = true
  
The problem is, normally that view cannot scroll as its contents are smaller than the available ScrollView height, but, by calling scrollTo inside of the `scrollResponderInputMeasureAndScrollToKeyboard` callback, the ScrollView is forced to scroll; however, it cannot be scrolled back down as it *still* cannot technically scroll. One solution would be to turn *back* on the `alwaysBounceVertical` behaviour of iOS ScrollViews as this means that even when the ScrollView contents are smaller than the content height it can be scrolled a little; however, this relies on the user to jiggle the ScrollView before the contents drop back into place and is overall a pretty janky behaviour:
  
![Image:](http://i.imgur.com/1esbont.gif)
  
taken on iOS with SHOULD_ANIMATE_CONTAINER = false and SHOULD_SCROLL_INTO_FOCUS = true
  
The solution I settled on was to use the Animated API to add additional padding equal to the current keyboard height to the bottom of my ScrollView so that this additional padding would never need to be added and I could turn off the (in my opinion very annoying) `alwaysBounceVertical` prop. And this created the desired behaviour!

And then everything was great! Except that it wasn't. I found that the method would work *most* of the time, and especially so on the simulator, but on my coworker's real iPhone 4S? This is what would happen:
  
![Image:](http://i.imgur.com/gIiMgm3.gif)
  
taken on iOS with SHOULD_ANIMATE_CONTAINER = true and SHOULD_SCROLL_INTO_FOCUS = true SHOULD_CONTENT_EXPAND_PAST_SCREEN = true and the block below commented out
  
After a lot of head scratching and trying new things I discovered the issue was that the following block in the `scrollResponderInputMeasureAndScrollToKeyboard` callback of the `scrollResponderScrollNativeHandleToKeyboard` method was not running:
  
````
if (this.keyboardWillOpenTo) {
  keyboardScreenY = this.keyboardWillOpenTo.endCoordinates.screenY;
}
````
  
Basically, the keyboard event (in iOS's case this is the keyboardWillShow event) was firing **AFTER** the onFocus event of the relevant TextInput. This meant that the method would calculate the desired end position without properly accounting for the keyboard and would scroll to the bottom of the screen. At the same time, the keyboard would open, creating the awkward experience shown above. Note that this is very hard to reproduce on a simulator. I had to comment out the block to achieve the desired effect for this demonstration but I assure you that it was happening on a real device.
  
To get around this issue, I decided to listen for the keyboard show/hide events in my ScrollView and wait until after the keyboard was open to actually fire the `scrollResponderScrollNativeHandleToKeyboard` method and doing so created the desired scrolling effect! This did require two things, however: to add a flag to touch events to indicate that they did not originate from a TextInput's focus (and as such will not trigger the keyboard), as otherwise such events would cause the component to wait forever for the keyboard event; and to add a timeout of 750 ms to trigger the scrolling anyways, in case the user is doing something unexpected like using their phone with a keyboard which would cause TextInput focus events to also not trigger a keyboard event. And ta-da! Elements now properly scroll into focus and take into consideration the keyboard's height!
  
However, there was still one more issue. I noticed early on after creating the animated padding component that Android seems to add this padding already, which meant that there was now double padding being added in response to the keyboard:
  
![Image:](http://i.imgur.com/RO60YqY.gif)
  
Android with SHOULD_ANIMATE_CONTAINER = true
  
Except when the focused input isn't inside of the relevant ScrollView
  
![Image:](http://i.imgur.com/p3qSkwe.gif)
  
Android with SHOULD_ANIMATE_CONTAINER = true
  
The fix was simple: to simply not perform the animations on Android.
  
![Image:](http://i.imgur.com/xxVinxx.gif)  
Android with SHOULD_ANIMATE_CONTAINER = false
  
I hope someone will be able to provide a solution that A) takes less work and B) is more consistent between platforms. This is, in my opinion, a very core functionality for mobile forms to have, and as such, should be something that React Native makes work for users with as little work as possible. If it turns out that my approach has been more or less the correct or expected way of handling things in React Native, I would propose the following:
  
- Add the keyboardWillShow and keyboardWillHide events to Android as this will allow responding to the keyboard to feel more fluid
- Provide a way to disable the automatic padding added on Android so that I can use the KeyboardSensitiveContainer or make iOS behave consistently with Android 
- Fix the `scrollResponderInputMeasureAndScrollToKeyboard` method to fire after the relevant keyboard event has fired so that the method properly calculates the available space for the content it is scrolling into view.  

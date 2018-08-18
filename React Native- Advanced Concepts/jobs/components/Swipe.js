import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  PanResponder,
  UIManager,
  View,
  Platform
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.35 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

const styles = {
  cardStyle: {
    position: 'absolute',
    width: SCREEN_WIDTH
  }
};

class Swipe extends Component {
  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    keyProp: PropTypes.string,
    onSwipeLeft: PropTypes.func,
    onSwipeRight: PropTypes.func,
    renderCard: PropTypes.func.isRequired,
    renderNoMoreCards: PropTypes.func.isRequired,
  }

  static defaultProps = {
    keyProp: 'id',
    onSwipeLeft: () => {},
    onSwipeRight: () => {}
  }

  state = {
    index: 0
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.setState({ index: 0 });
    }
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.spring();
  }

  onSwipeComplete(direction) {
    const {
      data,
      onSwipeLeft,
      onSwipeRight
    } = this.props;
    const item = data[this.state.index];
    direction === 'right' ? onSwipeRight(item) : onSwipeLeft(item);
    this.position.setValue({
      x: 0,
      y: 0
    });
    this.setState({ index: this.state.index + 1 });
  }

  getCardStyle() {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-120deg', '0deg', '120deg'],
    });
    return {
      ...this.position.getLayout(),
      transform: [{
        rotate,
      }]
    };
  }

  forceSwipe(direction) {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(this.position, {
      duration: SWIPE_OUT_DURATION,
      toValue: {
        x,
        y: 0,
      },
    }).start(() => {
      this.onSwipeComplete(direction);
    });
  }

  panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, { dx: x, dy: y }) => {
      this.position.setValue({
        x,
        y,
      });
    },
    onPanResponderRelease: (event, { dx }) => {
      if (dx > SWIPE_THRESHOLD) {
        this.forceSwipe('right');
      } else if (dx < -SWIPE_THRESHOLD) {
        this.forceSwipe('left');
      } else {
        this.resetPosition();
      }
    },
  });

  position = new Animated.ValueXY();

  resetPosition() {
    Animated.spring(this.position, {
      toValue: {
        x: 0,
        y: 0,
      }
    }).start();
  }

  renderCards() {
    const {
      data,
      renderNoMoreCards
    } = this.props;
    if (this.state.index >= data.length) {
      return renderNoMoreCards();
    }
    const deck = data.map(this.renderCard);
    return Platform.OS === 'android' ? deck : deck.reverse();
  }

  renderCard = (item, index) => {
    const {
      keyProp,
      renderCard
    } = this.props;
    if (index < this.state.index) {
      return null;
    }
    if (index === this.state.index) {
      return (
        <Animated.View
          {...this.panResponder.panHandlers}
          key={item[keyProp]}
          style={[this.getCardStyle(), styles.cardStyle, { zIndex: 99 }]}
        >
          {renderCard(item)}
        </Animated.View>
      );
    }
    return (
      <Animated.View
        key={item[keyProp]}
        style={[styles.cardStyle, { top: 10 * (index - this.state.index), zIndex: -index }]}
      >
        {renderCard(item)}
      </Animated.View>
    );
  }

  render() {
    return (
      <View>
        {this.renderCards()}
      </View>
    );
  }
}

export default Swipe;
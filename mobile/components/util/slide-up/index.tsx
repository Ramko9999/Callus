import {
  createNavigatorFactory,
  DefaultNavigatorOptions,
  EventArg,
  NavigationHelpersContext,
  StackActions,
  StackNavigationState,
  StackRouterOptions,
  useNavigationBuilder,
  ParamListBase,
  RouteProp,
  CommonNavigationAction,
  PartialState,
  Router,
  StackActionType,
  StackRouter,
} from "@react-navigation/native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useThemeColoring } from "../../Themed";

// --- SlideUpModal core ---
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const ANIMATION_CONFIG = {
  damping: 500,
  stiffness: 1000,
  mass: 3,
  overshootClamping: true,
  restDisplacementThreshold: 10,
  restSpeedThreshold: 10,
};

export type SlideUpModalRef = {
  close: () => void;
};

type SlideUpModalProps = {
  onClose: () => void;
  children: React.ReactNode;
};

const SlideUpModal = forwardRef<SlideUpModalRef, SlideUpModalProps>(
  ({ onClose, children }, ref) => {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const [hasAnimatedOnMount, setHasAnimatedOnMount] = useState(false);
    const backgroundColor = useThemeColoring("appBackground");

    const close = () => {
      translateY.value = withSpring(SCREEN_HEIGHT, ANIMATION_CONFIG, () => {
        runOnJS(onClose)();
      });
    };

    useImperativeHandle(ref, () => ({ close }));

    useEffect(() => {
      if (!hasAnimatedOnMount) {
        translateY.value = withSpring(0, ANIMATION_CONFIG, () => {
          runOnJS(setHasAnimatedOnMount)(true);
        });
      }
    }, [hasAnimatedOnMount]);

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    return (
      <Animated.View
        style={[
          slideUpStyles.container,
          animatedStyle,
          {
            backgroundColor,
            zIndex: 9999,
          },
        ]}
      >
        {children}
      </Animated.View>
    );
  }
);

SlideUpModal.displayName = "SlideUpModal";

const slideUpStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

// --- SlideUpModalNavigator types ---
type SlideUpModalNavigationOptions = Record<string, any>;
type SlideUpModalNavigationConfig = Record<string, unknown>;
type SlideUpModalNavigationEventMap = Record<string, any>;

type SlideUpModalDescriptor = {
  options: SlideUpModalNavigationOptions;
  render: () => React.ReactElement;
  navigation: any;
  removing?: boolean;
};

type SlideUpModalDescriptorMap = {
  [key: string]: SlideUpModalDescriptor;
};

type SlideUpModalNavigatorViewProps = SlideUpModalNavigationConfig & {
  state: StackNavigationState<any>;
  navigation: any;
  descriptors: SlideUpModalDescriptorMap;
};

type SlideUpModalRouteProps = {
  routeKey: string;
  descriptor: SlideUpModalDescriptor;
  onDismiss: (routeKey: string, removing: boolean) => void;
  removing?: boolean;
};

const SlideUpModalRoute = ({
  routeKey,
  descriptor: { options, render, navigation },
  onDismiss,
  removing = false,
}: SlideUpModalRouteProps) => {
  const ref = useRef<SlideUpModalRef>(null);
  const removingRef = useRef(false);
  removingRef.current = removing;

  const handleOnClose = useCallback(() => {
    onDismiss(routeKey, removingRef.current);
  }, []);

  useEffect(() => {
    if (removing === true && ref.current) {
      ref.current.close();
    }
  }, [removing]);

  return (
    <SlideUpModal ref={ref} onClose={handleOnClose}>
      {render()}
    </SlideUpModal>
  );
};

// --- SlideUpModalNavigatorView ---
const useForceUpdate = () => {
  const [, setState] = useState(false);
  const forceUpdate = useCallback(() => {
    setState((state) => !state);
  }, []);
  return forceUpdate;
};

const SlideUpModalNavigatorView = ({
  descriptors,
  state,
  navigation,
}: SlideUpModalNavigatorViewProps) => {
  const forceUpdate = useForceUpdate();
  const descriptorsCache = useRef<SlideUpModalDescriptorMap>({});
  const [firstKey, ...restKeys] = useMemo(
    () => state.routes.map((route) => route.key),
    [state.routes]
  );

  restKeys.forEach((key) => {
    descriptorsCache.current[key] = descriptors[key];
  });

  Object.keys(descriptorsCache.current)
    .filter((key) => !restKeys.includes(key))
    .forEach((key) => {
      descriptorsCache.current[key].removing = true;
    });

  const handleOnDismiss = useCallback((key: string, removed: boolean) => {
    delete descriptorsCache.current[key];
    if (removed) {
      forceUpdate();
    } else {
      navigation?.dispatch?.({
        ...StackActions.pop(),
        source: key,
        target: state.key,
      });
    }
  }, []);

  return (
    <NavigationHelpersContext.Provider value={navigation}>
      {descriptors[firstKey].render()}
      {Object.keys(descriptorsCache.current).map((key) => (
        <SlideUpModalRoute
          descriptor={descriptorsCache.current[key]}
          key={key}
          onDismiss={handleOnDismiss}
          removing={descriptorsCache.current[key].removing}
          routeKey={key}
        />
      ))}
    </NavigationHelpersContext.Provider>
  );
};

// --- SlideUpModalNavigator router ---
const slideUpModalRouter = (
  routerOptions: StackRouterOptions
): Router<
  StackNavigationState<any>,
  CommonNavigationAction | StackActionType
> => {
  const stackRouter = StackRouter(routerOptions);
  return {
    ...stackRouter,
    actionCreators: {
      ...stackRouter.actionCreators,
    },
    getStateForAction(state, action, options) {
      switch (action.type) {
        default:
          return stackRouter.getStateForAction(state, action, options) as
            | StackNavigationState<any>
            | PartialState<StackNavigationState<any>>
            | null;
      }
    },
  };
};

// --- SlideUpModalNavigator factory ---
type SlideUpModalNavigatorProps = DefaultNavigatorOptions<
  any,
  any,
  any,
  any,
  any,
  any
> &
  StackRouterOptions &
  SlideUpModalNavigationConfig;

const SlideUpModalNavigator = ({
  initialRouteName,
  children,
  screenOptions,
  ...rest
}: SlideUpModalNavigatorProps) => {
  const { state, descriptors, navigation } = useNavigationBuilder(
    slideUpModalRouter,
    {
      children,
      initialRouteName,
      screenOptions: screenOptions as
        | SlideUpModalNavigationOptions
        | ((props: {
            route: RouteProp<ParamListBase, string>;
            navigation: any;
          }) => SlideUpModalNavigationOptions)
        | undefined,
    }
  );

  React.useEffect(
    () =>
      navigation.addListener?.("tabPress", (e: any) => {
        const isFocused = navigation.isFocused();
        requestAnimationFrame(() => {
          if (
            state.index > 0 &&
            isFocused &&
            !(e as EventArg<"tabPress", true>).defaultPrevented
          ) {
            navigation.dispatch({
              ...StackActions.popToTop(),
              target: state.key,
            });
          }
        });
      }),
    [navigation, state.index, state.key]
  );

  return (
    <NavigationHelpersContext.Provider value={navigation}>
      <SlideUpModalNavigatorView
        {...rest}
        descriptors={descriptors}
        navigation={navigation}
        state={state}
      />
    </NavigationHelpersContext.Provider>
  );
};

export const createSlideUpModalNavigator = createNavigatorFactory(
  SlideUpModalNavigator
);

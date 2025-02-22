import { useThemeColoring, View, Text } from "@/components/Themed";
import { textTheme } from "@/constants/Themes";
import { ICON_ACTION_DIMENSION, StyleUtils } from "@/util/styles";
import { FontAwesome } from "@expo/vector-icons";
import {
  ArrowDown,
  ArrowLeft,
  ChartNoAxesColumnIncreasing,
  Flag,
  ListFilter,
  Repeat as LucideRepeat,
  Timer as LucideTimer,
  Plus,
  Trash2,
} from "lucide-react-native";
import { ViewStyle, StyleSheet, TouchableOpacity } from "react-native";

const iconActionStyles = StyleSheet.create({
  container: {
    height: ICON_ACTION_DIMENSION,
    width: ICON_ACTION_DIMENSION,
    borderRadius: Math.ceil(ICON_ACTION_DIMENSION / 2),
    ...StyleUtils.flexRowCenterAll(),
  },
});

const textActionStyles = StyleSheet.create({
  container: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    ...StyleUtils.flexRowCenterAll(),
  },
  text: {
    fontWeight: 600,
    color: "white",
  },
});

type ActionProps = {
  onClick?: () => void;
  iconSize?: number;
  style?: ViewStyle;
};

export function Trash({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("dangerAction") },
          style,
        ]}
      >
        <Trash2 strokeWidth={2} color={useThemeColoring("primaryText")} />
      </View>
    </TouchableOpacity>
  );
}

export function Edit({ onClick, style, iconSize }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="pencil"
          size={iconSize ?? textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Close({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("calendarDayBackground") },
          style,
        ]}
      >
        <ArrowDown strokeWidth={3} color={useThemeColoring("primaryText")} />
      </View>
    </TouchableOpacity>
  );
}

export function Back({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("calendarDayBackground") },
          style,
        ]}
      >
        <ArrowLeft strokeWidth={3} color={useThemeColoring("primaryText")} />
      </View>
    </TouchableOpacity>
  );
}

export function Add({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("calendarDayBackground") },
          style,
        ]}
      >
        <Plus strokeWidth={3} color={useThemeColoring("primaryText")} />
      </View>
    </TouchableOpacity>
  );
}

export function Start({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("calendarDayBackground") },
          style,
        ]}
      >
        <Flag strokeWidth={2} color={useThemeColoring("primaryText")} />
      </View>
    </TouchableOpacity>
  );
}

export function Timer({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("calendarDayBackground") },
          style,
        ]}
      >
        <LucideTimer strokeWidth={2} color={useThemeColoring("primaryText")} />
      </View>
    </TouchableOpacity>
  );
}

export function Progress({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("calendarDayBackground") },
          style,
        ]}
      >
        <ChartNoAxesColumnIncreasing
          strokeWidth={3}
          color={useThemeColoring("primaryText")}
        />
      </View>
    </TouchableOpacity>
  );
}

const filterStyles = StyleSheet.create({
  indication: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: "absolute",
    bottom: 8,
    right: 10,
    zIndex: 1,
  },
});

type FilterActionProps = ActionProps & {
  hasFilters: boolean;
};

export function Filter({ onClick, style, hasFilters }: FilterActionProps) {
  const hasFiltersColor = useThemeColoring("primaryAction");
  const notHasFiltersColor = useThemeColoring("primaryText");

  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("calendarDayBackground") },
          style,
        ]}
      >
        <ListFilter
          strokeWidth={3}
          color={hasFilters ? hasFiltersColor : notHasFiltersColor}
        />
        {hasFilters && (
          <View
            style={[
              filterStyles.indication,
              { backgroundColor: hasFiltersColor },
            ]}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

export function Minus({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="minus"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Search({ onClick, style, iconSize }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="search"
          size={iconSize ?? textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Done({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="check"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Time({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="clock-o"
          size={textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Repeat({ onClick, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          iconActionStyles.container,
          { backgroundColor: useThemeColoring("calendarDayBackground") },
          style,
        ]}
      >
        <LucideRepeat strokeWidth={3} color={useThemeColoring("primaryText")} />
      </View>
    </TouchableOpacity>
  );
}

export function Settings({ onClick, iconSize, style }: ActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View style={[iconActionStyles.container, style]}>
        <FontAwesome
          name="gear"
          size={iconSize ?? textTheme.large.fontSize}
          color={useThemeColoring("lightText")}
        />
      </View>
    </TouchableOpacity>
  );
}

type TextActionProps = ActionProps & { text: string };

export function SignificantAction({ onClick, style, text }: TextActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          textActionStyles.container,
          { backgroundColor: useThemeColoring("primaryAction") },
          style,
        ]}
      >
        <Text neutral style={textActionStyles.text}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function NeutralAction({ onClick, style, text }: TextActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        background
        style={[
          textActionStyles.container,
          { backgroundColor: useThemeColoring("dynamicHeaderBorder") },
          style,
        ]}
      >
        <Text neutral style={textActionStyles.text}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function DangerAction({ onClick, style, text }: TextActionProps) {
  return (
    <TouchableOpacity onPress={onClick}>
      <View
        style={[
          textActionStyles.container,
          { backgroundColor: useThemeColoring("dangerAction") },
          style,
        ]}
      >
        <Text neutral style={textActionStyles.text}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

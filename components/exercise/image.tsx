import { View, ImageStyle, Image } from "react-native";
import {
  getExerciseDemonstrationFromMetaId,
  isExerciseCustom,
} from "@/api/exercise";
import { getCustomExerciseUri } from "@/api/store/fs";
import { Image as ImageIcon } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { StyleUtils } from "@/util/styles";

const exerciseImageStyles = StyleSheet.create({
  fallback: {
    ...StyleUtils.flexRowCenterAll(),
  },
});

type ExerciseImageProps = {
  metaId: string;
  imageStyle: ImageStyle;
  fallbackSize: number;
  fallbackColor: string;
};

export function ExerciseImage({
  metaId,
  imageStyle,
  fallbackSize,
  fallbackColor,
}: ExerciseImageProps) {
  const [hasError, setHasError] = useState(false);

  const isCustom = isExerciseCustom(metaId);

  const imageSource = isCustom
    ? { uri: getCustomExerciseUri(metaId) }
    : getExerciseDemonstrationFromMetaId(metaId);

  if (!imageSource || hasError) {
    return (
      <View style={[exerciseImageStyles.fallback, imageStyle]}>
        <ImageIcon size={fallbackSize} color={fallbackColor} />
      </View>
    );
  }

  return (
    <Image
      source={imageSource}
      style={imageStyle}
      resizeMode="contain"
      onError={() => setHasError(true)}
    />
  );
}

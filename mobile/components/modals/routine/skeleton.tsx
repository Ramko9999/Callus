import { StyleUtils } from "@/util/styles";
import { View, StyleSheet } from "react-native";
import { HeaderPage } from "@/components/util/header-page";
import { CloseButton } from "@/components/pages/common";
import { useNavigation } from "@react-navigation/native";

const skeletionStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(),
    flex: 1,
    paddingTop: "3%",
  },
});

export function Skeleton() {
  const navigation = useNavigation();

  return (
    <HeaderPage
      title=""
      leftAction={<CloseButton onClick={() => navigation.goBack()} />}
    >
      <View style={skeletionStyles.container} />
    </HeaderPage>
  );
}

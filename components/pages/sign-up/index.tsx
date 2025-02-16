import { UserApi, UserDetails } from "@/api/user";
import { NeutralAction, SignificantAction } from "@/components/theme/actions";
import {
  TextInput,
  View,
  Text,
  useThemeColoring,
  TextInputProps,
} from "@/components/Themed";
import { HeaderPage } from "@/components/util/header-page";
import { StyleUtils } from "@/util/styles";
import { useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Keyboard,
  TextInput as DefaultTextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserDetails } from "@/components/user-details";

const signUpTextInputStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(10),
    paddingBottom: "1%",
    borderBottomWidth: 1,
  },
  value: {
    ...StyleUtils.flexRow(5),
    alignItems: "baseline",
  },
});

type SignUpTextInputProps = {
  label: string;
  unit?: string;
} & TextInputProps;

function SignUpTextInput({
  label,
  unit,
  value,
  ...props
}: SignUpTextInputProps) {
  const placeHolderColor = useThemeColoring("textInputPlaceholderColor");
  const valueColor = useThemeColoring("primaryText");
  const inputRef = useRef<DefaultTextInput>(null);

  return (
    <Pressable
      style={[
        signUpTextInputStyles.container,
        { borderBottomColor: useThemeColoring("primaryViewBackground") },
      ]}
      onPress={(event) => {
        event.stopPropagation();
        inputRef.current?.focus();
      }}
    >
      <Text>{label}</Text>
      <View style={signUpTextInputStyles.value}>
        <TextInput
          ref={inputRef}
          placeholderTextColor={placeHolderColor}
          {...props}
        />
        {unit && (
          <Text
            style={{
              color: value == undefined ? placeHolderColor : valueColor,
            }}
          >
            lbs
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const signUpStyles = StyleSheet.create({
  container: {
    ...StyleUtils.flexColumn(20),
    paddingTop: "2%",
    paddingHorizontal: "3%",
    flex: 1,
  },
});

type RegistrationState = Partial<UserDetails>;

export function SignUp() {
  const [{ name, bodyweight }, setState] = useState<RegistrationState>({});
  const { setUserDetails } = useUserDetails();
  const navigation = useNavigation();
  const hasEnteredAllDetails = name != undefined && bodyweight != undefined;

  return (
    <HeaderPage title="Register">
      <Pressable style={signUpStyles.container} onPress={Keyboard.dismiss}>
        <SignUpTextInput
          label="Name"
          placeholder="name"
          value={name}
          onChangeText={(value) =>
            setState((s) => ({
              ...s,
              name: value ? value.trim() : undefined,
            }))
          }
        />
        <SignUpTextInput
          label="Bodyweight"
          value={bodyweight?.toString()}
          placeholder="150"
          unit="lbs"
          keyboardType="numeric"
          onChangeText={(value) =>
            setState((s) => ({
              ...s,
              bodyweight: value ? parseInt(value) : undefined,
            }))
          }
        />

        {hasEnteredAllDetails ? (
          <SignificantAction
            text="Register"
            onClick={() => {
              Keyboard.dismiss();
              UserApi.upsertUserDetails({
                name: name as string,
                bodyweight: bodyweight as number,
              }).then(() => {
                setUserDetails({ name, bodyweight });
                navigation.navigate("tabs" as never);
              });
            }}
          />
        ) : (
          <NeutralAction text="Register" />
        )}
      </Pressable>
    </HeaderPage>
  );
}

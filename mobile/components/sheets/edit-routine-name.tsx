import React, { forwardRef, useCallback } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { PopupBottomSheetModal } from "@/components/util/popup/sheet";
import { NameEditor } from "./name-editor";

type EditRoutineNameProps = {
  show: boolean;
  hide: () => void;
  onHide: () => void;
  name: string;
  mode: "create" | "rename";
  onSave: (name: string) => void;
};

export const EditRoutineName = forwardRef<
  BottomSheetModal,
  EditRoutineNameProps
>(({ show, hide, onHide, name, mode, onSave }, ref) => {
  const isCreating = mode === "create";
  // A brand new routine is seeded with "New Routine", which is a placeholder
  // rather than a name the user chose — start empty so the hint shows instead.
  const initialName = isCreating && name === "New Routine" ? "" : name;

  const handleSubmit = useCallback(
    (trimmedName: string) => {
      onSave(trimmedName);
      hide();
    },
    [onSave, hide]
  );

  return (
    <PopupBottomSheetModal onDismiss={onHide} ref={ref}>
      <NameEditor
        title={isCreating ? "Name Routine" : "Edit Name"}
        placeholder="e.g. Push Day"
        initialName={initialName}
        submitLabel={isCreating ? "Continue" : "Save"}
        onSubmit={handleSubmit}
        resetToken={show ? `${mode}:${name}` : undefined}
      />
    </PopupBottomSheetModal>
  );
});

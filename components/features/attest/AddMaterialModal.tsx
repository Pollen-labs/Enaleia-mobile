import { MaterialDetail, MaterialNames, MaterialsData } from "@/types/material";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  Keyboard,
  ScrollView,
  Text,
  View,
  Pressable,
} from "react-native";
import { Modal } from "@/components/shared/Modal";

const SelectMaterialItem = React.memo(
  ({
    label,
    value,
    isSelected,
    handleAddMaterial,
  }: {
    label: MaterialNames;
    value: number;
    isSelected: boolean;
    handleAddMaterial: (materialId: number) => void;
  }) => {
    const handlePress = useCallback(() => {
      handleAddMaterial(value);
    }, [value, handleAddMaterial]);

    return (
      <Pressable
        accessibilityLabel={`Select ${label}`}
        accessibilityRole="button"
        accessibilityHint={`Tap to select ${label} material`}
        accessibilityState={{ selected: isSelected }}
        className="bg-white w-full px-4 py-3 rounded-2xl flex flex-row items-center justify-between border-[1.5px] border-grey-3 mb-2"
        onPress={handlePress}
      >
        <Text className="text-base font-dm-bold text-enaleia-black tracking-tighter">
          {label}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color="#0D0D0D" />
        )}
      </Pressable>
    );
  }
);

export default function AddMaterialModal({
  isVisible,
  onClose,
  selectedMaterials,
  setSelectedMaterials,
  materials,
  onMaterialSelect,
}: {
  isVisible: boolean;
  materials: MaterialsData["options"];
  onClose: () => void;
  selectedMaterials: MaterialDetail[];
  setSelectedMaterials: (materials: MaterialDetail[]) => void;
  onMaterialSelect?: () => Promise<void>;
}) {
  const selectedIds = (selectedMaterials || []).map((m) => m.id);

  const handleAddMaterial = async (materialId: number) => {
    if (selectedIds.includes(materialId)) return;

    const currentMaterials = selectedMaterials || [];
    const newMaterialDetails: MaterialDetail[] = [
      ...currentMaterials,
      {
        id: materialId,
        weight: null,
        code: "",
      },
    ];
    setSelectedMaterials(newMaterialDetails);
    Keyboard.dismiss();
    onClose();

    if (onMaterialSelect) {
      await onMaterialSelect();
    }
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <View className="flex-1 bg-white rounded-t-[32px] overflow-hidden">
        <View style={{
          alignSelf: 'center',
          width: 36,
          height: 5,
          borderRadius: 3,
          backgroundColor: '#DDDDDD',
          marginTop: 16,
          marginBottom: 4,
        }} />

        <View className="px-5 pt-2 pb-2 flex-row justify-center items-center">
          <Text className="text-3xl font-dm-bold text-enaleia-black text-center w-full">
            Select Material
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {materials.map(({ label, value }) => (
            <SelectMaterialItem
              key={value}
              label={label as MaterialNames}
              value={value}
              isSelected={selectedIds.includes(value)}
              handleAddMaterial={handleAddMaterial}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
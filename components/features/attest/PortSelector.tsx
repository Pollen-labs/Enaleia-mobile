import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import ModalBase from "@/components/shared/ModalBase";
import { PortData } from "@/types/batch";

interface PortSelectorProps {
  value?: number;
  onChange: (value: number) => void;
  ports: PortData[];
  countryIds: number[];
  isLoading?: boolean;
  disabled?: boolean;
}

export default function PortSelector({
  value,
  onChange,
  ports,
  countryIds,
  isLoading = false,
  disabled = false,
}: PortSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const filteredPorts =
    countryIds.length > 0
      ? ports.filter((p) => countryIds.includes(p.country?.country_id ?? -1))
      : ports;

  const selectedPort = ports.find((p) => p.id === value);

  const portLabel = selectedPort
    ? selectedPort.city
      ? `${selectedPort.name} — ${selectedPort.city}`
      : selectedPort.name
    : undefined;

  return (
    <>
      <Pressable
        onPress={() => !disabled && !isLoading && setIsOpen(true)}
        className={`flex-row items-center justify-between rounded-2xl p-2 px-4 h-[65px] bg-white border-[1.5px] ${
          disabled || isLoading ? "border-grey-3 opacity-50" : "border-grey-3"
        }`}
        accessibilityRole="button"
        accessibilityLabel="Select reception port"
        accessibilityState={{ selected: !!selectedPort, disabled: disabled || isLoading }}
        accessibilityHint="Double tap to open port selection"
      >
        <View className="flex-1">
          <Text className="text-sm font-dm-bold text-grey-6 tracking-tighter">
            Port name
          </Text>
          <Text
            className="font-dm-bold text-xl tracking-tighter text-enaleia-black"
            numberOfLines={1}
          >
            {isLoading ? "Loading..." : portLabel || "Select port"}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color="#0D0D0D"
          style={{ marginLeft: 8 }}
        />
      </Pressable>

      <ModalBase isVisible={isOpen} onClose={() => setIsOpen(false)}>
        <View className="pb-8 pt-4 px-4">
          <Text className="text-xl font-dm-bold text-enaleia-black tracking-tighter text-center mb-6">
            Collected at
          </Text>
          {filteredPorts.length === 0 ? (
            <Text className="text-center text-grey-6 font-dm-regular">
              No ports available
            </Text>
          ) : (
            <ScrollView className="max-h-96">
              {filteredPorts.map((port) => (
                <Pressable
                  key={port.id}
                  onPress={() => {
                    onChange(port.id);
                    setIsOpen(false);
                  }}
                  className="bg-white w-full px-4 py-3 rounded-2xl flex flex-row items-center justify-between border-[1.5px] border-grey-3 mb-2"
                  accessibilityRole="menuitem"
                  accessibilityLabel={port.name}
                  accessibilityState={{ selected: port.id === value }}
                >
                  <View className="flex-1">
                    <Text className="text-base font-dm-bold text-enaleia-black tracking-tighter">
                      {port.name}
                    </Text>
                    {port.city && (
                      <Text className="text-sm font-dm-regular text-grey-6 tracking-tighter">
                        {port.city}
                      </Text>
                    )}
                  </View>
                  {port.id === value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#0D0D0D"
                    />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </ModalBase>
    </>
  );
}
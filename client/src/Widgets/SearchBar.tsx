import React from "react";
import { Icon, Button, Input, Group, InputAddon } from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";

export default function Searchbar({
  name = "q",
  value,
  dataTest,
  onInput,
  onChange,
}: {
  name?: string;
  value: string;
  dataTest?: string;
  onInput?: React.FormEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <>
      <Group borderLeftRadius={5}>
        <InputAddon pointerEvents="none">
          <Icon as={IoSearchSharp} color="gray.600" />
        </InputAddon>
        <Input
          type="search"
          placeholder="Search..."
          border="1px solid #949494"
          borderLeftRadius={5}
          name={name}
          data-test={dataTest}
          value={value}
          onInput={onInput}
          onChange={onChange}
        />
        <InputAddon
          p={0}
          border="none"
          borderLeftRadius={0}
          borderRightRadius={5}
        >
          <Button
            type="submit"
            size="sm"
            colorScheme="blue"
            borderLeftRadius={0}
            borderRightRadius={5}
          >
            Search
          </Button>
        </InputAddon>
      </Group>
    </>
  );
}

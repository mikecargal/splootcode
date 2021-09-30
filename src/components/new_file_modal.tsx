import React, { useState } from 'react';

import { Box, Button, FormControl, FormHelperText, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useRadio, useRadioGroup } from "@chakra-ui/react"
import { FileType } from '@splootcode/editor';

const fileExtension : {[key: string]: string} = {}
fileExtension[FileType.HtmlDocument] = '.html'
fileExtension[FileType.JavaScript] = '.js'
fileExtension[FileType.DataSheet] = '.sheet'

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  addCodeFile: (name: string, type: FileType) => void;
}

export function NewFileModal(props: NewFileModalProps) {
  let { isOpen, onClose, addCodeFile} = props;

  let [fileType, setFileType] = useState(FileType.HtmlDocument);
  let [fileName, setFileName] = useState('newfile' + fileExtension[FileType.HtmlDocument]);

  const { getRootProps, getRadioProps, setValue } = useRadioGroup({
    name: "type",
    defaultValue: FileType.HtmlDocument,
    onChange: (value) => {
      let ext = fileExtension[value];
      if (!fileName.endsWith(ext)) {
        let idx = fileName.indexOf('.');
        if (idx !== -1) {
          setFileName(fileName.slice(0, idx) + ext);
        } else {
          setFileName(fileName + ext);
        }
      }
      setFileType(value as FileType);
    },
  })
  const group = getRootProps()

  const handleLoad = async (event) => {
    addCodeFile(fileName, fileType);
    onClose();
  };

  let valid = fileName.endsWith(fileExtension[fileType]);
  const inputRef = React.useRef()

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size='xl' initialFocusRef={inputRef}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>New file</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <FormControl id="filename">
            <Input placeholder="name" ref={inputRef} onChange={(event) => {
              let name = event.target.value;
              for (let type in fileExtension) {
                if (name.endsWith(fileExtension[type])) {
                  setValue(type);
                  setFileType(type as FileType);
                }
              }
              setFileName(name);
            }} value={fileName}/>
            <FormHelperText></FormHelperText>
          </FormControl>
          <HStack {...group}>
            {/*
              // @ts-ignore */}
            <RadioCard key={FileType.HtmlDocument} {...getRadioProps({value: FileType.HtmlDocument})}>
              HTML
            </RadioCard>
            {/*
              // @ts-ignore */}
            <RadioCard key={FileType.JavaScript} {...getRadioProps({value: FileType.JavaScript})}>
              JavaScript 
            </RadioCard>
            {/*
              // @ts-ignore */}
            <RadioCard key={FileType.DataSheet} {...getRadioProps({value: FileType.DataSheet})}>
              Data Spreadsheet
            </RadioCard>
          </HStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleLoad} disabled={!valid}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "whiteAlpha.300",
          color: "white",
          borderColor: "blue.300",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={3}
        py={1}
      >
        {props.children}
      </Box>
    </Box>
  )
}

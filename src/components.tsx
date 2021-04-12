import React, { useState } from "react";
import { Button, Input, Modal } from "semantic-ui-react";

// A Confirm modal that only enables the confirm button when a user types in a
// specific text string.
function TextConfirmModal(props: {
  onConfirm: () => void;
  onCancel: () => void;
  headerText?: string;
  // The contents of the confirmation button.
  confirmButtonText: string;
  // The text string the user must type for the confirmation button to enable.
  textConfirmation: string;
  // An optional description string displayed above the textConfirmation input.
  description?: string;
}) {
  const [confirmEnabled, setConfirmEnabled] = useState(false);

  return (
    <Modal open={true}>
      {props.headerText && <Modal.Header>{props.headerText}</Modal.Header>}
      <Modal.Content>
        <p>Are you sure? {props.description}</p>
        <p>
          Please type <b>{props.textConfirmation}</b> to confirm.
        </p>
        <Input
          onChange={(_e, { value }) => {
            setConfirmEnabled(value === props.textConfirmation);
          }}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={props.onCancel}>Cancel</Button>
        <Button onClick={props.onConfirm} negative disabled={!confirmEnabled}>
          {props.confirmButtonText}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export { TextConfirmModal };

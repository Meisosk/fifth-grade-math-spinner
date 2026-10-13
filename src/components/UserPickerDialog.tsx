import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  FormLabel,
  MenuItem,
  Select,
} from "@mui/material";
import {
  ANONYMOUS,
  SAVED_USERS,
  isSavedUser,
  type SpinnerUser,
} from "../lib/names";

interface UserPickerDialogProps {
  open: boolean;
  onPick: (user: SpinnerUser) => void;
}

const USERS: SpinnerUser[] = [...SAVED_USERS, ANONYMOUS];

// No onClose: the dialog can only be dismissed by picking a user.
export default function UserPickerDialog({
  open,
  onPick,
}: UserPickerDialogProps) {
  const [user, setUser] = useState<SpinnerUser>(SAVED_USERS[0]);

  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle>Who's spinning?</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <FormLabel id="user-picker-label" sx={{ mb: 0.75 }}>
            User
          </FormLabel>
          <Select
            labelId="user-picker-label"
            value={user}
            onChange={(e) => setUser(e.target.value as SpinnerUser)}
          >
            {USERS.map((u) => (
              <MenuItem key={u} value={u}>
                {u}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText sx={{ mx: 0 }}>
            {isSavedUser(user)
              ? `${user}'s names are saved and come back next time.`
              : "Nothing is saved. Names are gone when you leave."}
          </FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => onPick(user)}>
          Start
        </Button>
      </DialogActions>
    </Dialog>
  );
}

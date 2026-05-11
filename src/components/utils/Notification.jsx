import { rem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

const notify = ({
  title,
  message,
  id,
  success = false,
  error = false,
  color = "#c5a059",
  icon,
  autoClose = 3000,
}) => {
  const notificationColor = success
    ? "#c5a059"
    : error
      ? "red"
      : color;

  const notificationIcon =
    icon ||
    (success ? (
      <IconCheck style={{ width: rem(20), height: rem(20) }} />
    ) : (
      <IconX style={{ width: rem(20), height: rem(20) }} />
    ));

  notifications.show({
    id,
    color: notificationColor,
    title,
    message,
    autoClose,
    withBorder: true,
    icon: notificationIcon,
  });
};

export default notify;
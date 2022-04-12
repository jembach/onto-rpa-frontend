const faDefaulSettings = {
  sizes: {
    default: null,
    small: "fa-xs",
    medium: "fa-lg",
    large: "fa-xl",
  },
  iconPrefix: "fa-",
  internalIcons: {
    "alert-circle": "circle-exclamation fa-fade",
  },
};

export default {
  iconPack: "fa-solid",
  customIconPacks: {
    "fa-solid": faDefaulSettings,
    "fa-regular": faDefaulSettings,
  },
  notification: {
    duration: 3000,
    position: "bottom",
  },
};

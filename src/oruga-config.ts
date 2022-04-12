const faDefaulSettings = {
  sizes: {
    default: null,
    small: "fa-xs",
    medium: "fa-lg",
    large: "fa-2x",
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

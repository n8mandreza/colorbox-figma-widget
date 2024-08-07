/** @jsx figma.widget.h */

import { emit, on, once, showUI } from '@create-figma-plugin/utilities'

const { widget } = figma
const { AutoLayout, Input, Text, useSyncedState, usePropertyMenu } = widget

const ModeIcon = `<svg fill="none" height="20" viewBox="0 0 40 40" width="20" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m20 38c-9.9411 0-18-8.0589-18-18s8.0589-18 18-18 18 8.0589 18 18-8.0589 18-18 18zm0-35v34c9.3888 0 17-7.6112 17-17s-7.6112-17-17-17zm.0002 9.8001c3.9764 0 7.2 3.2235 7.2 7.2 0 3.9764-3.2236 7.2-7.2 7.2zm-.0004 14.3998c-3.9764 0-7.2-3.2235-7.2-7.2 0-3.9764 3.2236-7.2 7.2-7.2z" fill="#fff" fill-rule="evenodd"/></svg>`

export default function () {
  widget.register(ColorScale)

  on('RESIZE_WINDOW', function (windowSize: { width: number; height: number }) {
    const { width, height } = windowSize
    figma.ui.resize(width, height)
  })
}

interface IColor {
  step: number;
  hue: number;
  saturation: number;
  brightness: number;
  isMajor: boolean;
  isLocked: boolean;
  hex: string;
  hsl: number[];
  hsv: number[];
  lab: number[];
  rgbString: string;
  rgbArray: number[];
  rgbaString: string;
  rgbaArray: number[];
}

interface IColorScale {
  name: string;
  colors: IColor[];
  inverted: boolean;
  // Add other properties as needed
}

function ColorScale() {
  const [darkMode, setDarkMode] = useSyncedState<boolean>('darkMode', false);
  const [rgb, setRgb] = useSyncedState<boolean>('rgb', false);

  const [specs, setSpecs] = useSyncedState('specs', null)
  const [colorScale, setColorScale] = useSyncedState<IColorScale | null>('colorScale', null);
  
  const [hueStart, setHueStart] = useSyncedState('hueStart', null);
  const [hueEnd, setHueEnd] = useSyncedState('hueEnd', null); 
  const [hueCurve, setHueCurve] = useSyncedState('hueCurve', '');

  const [satStart, setSatStart] = useSyncedState('satStart', null);
  const [satEnd, setSatEnd] = useSyncedState('satEnd', null);
  const [satCurve, setSatCurve] = useSyncedState('satCurve', '');
  const [satRate, setSatRate] = useSyncedState('satRate', null);

  const [brightStart, setBrightStart] = useSyncedState('brightStart', null);
  const [brightEnd, setBrightEnd] = useSyncedState('brightEnd', null);
  const [brightCurve, setBrightCurve] = useSyncedState('brightCurve', '');

  const items: Array<WidgetPropertyMenuItem> = [
    {
      itemType: "toggle",
      tooltip: "Dark Mode",
      propertyName: "darkMode",
      icon: ModeIcon,
      isToggled: darkMode
    },
    {
      itemType: "toggle",
      tooltip: "RGB",
      propertyName: "rgb",
      isToggled: rgb
    },
    {
      itemType: 'action',
      propertyName: 'edit',
      tooltip: 'Edit'
    },
  ]

  async function onChange({
    propertyName
  }: WidgetPropertyEvent): Promise<void> {
    await new Promise<void>(function (resolve: () => void): void {
      if (propertyName === 'edit') {
        showUI(
          { height: 440, width: 360 }, 
          { specs, colorScale, hueStart, hueEnd, hueCurve, satStart, satEnd, satCurve, satRate, brightStart, brightEnd, brightCurve }
        )

        once(
          'UPDATE_SPECS', 
          function (specs: any): void {
            setSpecs(specs)

            if (specs) {
              try {
                const parsedSpecs = JSON.parse(specs);
                if (parsedSpecs.length > 0 && parsedSpecs[0].properties) {
                  // Only grab the first item in the specs array
                  const { hue, saturation, brightness } = parsedSpecs[0].properties;

                  // Update hue properties
                  setHueStart(hue.start);
                  setHueEnd(hue.end);
                  setHueCurve(hue.curve);

                  // Update saturation properties
                  setSatStart(saturation.start);
                  setSatEnd(saturation.end);
                  setSatCurve(saturation.curve);
                  setSatRate(saturation.rate);

                  // Update brightness properties
                  setBrightStart(brightness.start);
                  setBrightEnd(brightness.end);
                  setBrightCurve(brightness.curve);
                }
              } catch (error) {
                console.error("Error parsing specs JSON:", error);
              }
            }
            resolve()
        })
      }

      if (propertyName === 'darkMode') {
        setDarkMode(!darkMode)
        resolve()
      }

      if (propertyName === 'rgb') {
        setRgb(!rgb)
        resolve()
      }
    })
  }

  usePropertyMenu(items, onChange)

  on('UPDATE_COLORS', function (colorScale: any): void {
    if (colorScale) {
      setColorScale(colorScale[0]);
    } else {
      console.error("Received invalid colors object");
    }
  });

  const calculateRelativeLuminance = (rgb: number[]) => {
    const luminance = rgb.map(channel => {
      const sRGB = channel / 255;
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * luminance[0] + 0.7152 * luminance[1] + 0.0722 * luminance[2];
  };

  const calculateContrastRatio = (rgb1: number[], rgb2: number[]) => {
    const luminance1 = calculateRelativeLuminance(rgb1);
    const luminance2 = calculateRelativeLuminance(rgb2);
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    return Math.round(ratio * 100) / 100; // Matching the rounding in your original function
  };

  const getTextColor = (rgbArray: number[]) => {
    const white = [255, 255, 255];
    const bgLuminance = calculateRelativeLuminance(rgbArray);
    const whiteContrast = (calculateRelativeLuminance(white) + 0.05) / (bgLuminance + 0.05);
    return whiteContrast > 4.5 ? '#FFFFFF' : '#000000'; // Using 4.5 as the minimum contrast ratio for readability
  };

  return (
    <AutoLayout
      name="Color Scale"
      fill={darkMode ? "#121212CC" : "#E6E6E6CC"}
      stroke="#FFFFFF26"
      cornerRadius={24}
      direction="vertical"
      spacing={12}
      padding={16}
      width="hug-contents"
      minWidth={320}
      verticalAlignItems="center"
      horizontalAlignItems="center"
      effect={[
        {
          blur: 40,
          type: "background-blur",
        },
        {
          type: "drop-shadow",
          color: "#12121233",
          offset: {
            x: 0,
            y: 8,
          },
          blur: 24,
          showShadowBehindNode:
            false,
        },
      ]}
    >
      <AutoLayout
        name='Swatches'
        direction="vertical"
        width="fill-parent"
        stroke={darkMode ? "#494949" : "#AAAAAA"}
        horizontalAlignItems="start"
        verticalAlignItems="start"
        cornerRadius={16}
      >
        {colorScale && colorScale.colors.map((color) => {
          const textColor = getTextColor(color.rgbArray);
          const contrastRatioWhite = calculateContrastRatio(color.rgbArray, [255, 255, 255]);
          const contrastRatioBlack = calculateContrastRatio(color.rgbArray, [0, 0, 0]);

          return (
            <AutoLayout
              key={color.step}
              name="Swatch"
              width="fill-parent"
              height="hug-contents"
              fill={color.hex}
              spacing="auto"
              padding={12}
            >
              <Text
                fill={textColor}
                fontSize={14}
                horizontalAlignText="left"
              >
                {color.step}
              </Text>

              <Text
                fill={textColor}
                fontSize={14}
                horizontalAlignText="left"
              >
                {`${contrastRatioWhite}`}
              </Text>

              <Text
                fill={textColor}
                fontSize={14}
                horizontalAlignText="left"
              >
                {`${contrastRatioBlack}`}
              </Text>

              <AutoLayout>
                <Text
                  fontSize={14}
                  horizontalAlignText='right'
                >
                  {color.isLocked ? '🔒' : ''}
                </Text>

                {rgb ? (
                  <Input
                    fill={textColor}
                    fontSize={14}
                    horizontalAlignText="right"
                    width={90}
                    value={`${color.rgbString}`}
                    onTextEditEnd={(e) => {
                      const currentValue = `${color.rgbString}`
                      e.characters = currentValue
                    }}
                  />
                ) : (
                  <Input
                    fill={textColor}
                    fontSize={14}
                    horizontalAlignText="right"
                    width={72}
                    value={`${color.hex.toUpperCase()}`}
                    onTextEditEnd={(e) => {
                      const currentValue = `${color.hex.toUpperCase()}`
                      e.characters = currentValue
                    }}
                  />
                )}
              </AutoLayout>
            </AutoLayout>
            )
        })}
      </AutoLayout>

      <AutoLayout
        name='Info'
        direction='vertical'
        width='fill-parent'
        spacing={12}
      >
        <Text
          fill={darkMode ? "#FFF" : "#121212"}
          fontSize={23}
          lineHeight={28}
          fontWeight={700}
          width="fill-parent"
          horizontalAlignText="left" 
        >
          {colorScale ? colorScale.name : `Name`}
        </Text>

        <Text
          fill={darkMode ? "#FFF" : "#121212"}
          fontSize={16}
          width="fill-parent"
          horizontalAlignText="left"
        >
          H: {hueStart != null && hueEnd != null && hueCurve != null ? (
            `${hueStart} – ${hueEnd} ${hueCurve}`
          ) : '--'}
        </Text>

        <Text
          fill={darkMode ? "#FFF" : "#121212"}
          fontSize={16}
          width="fill-parent"
          horizontalAlignText="left"
        >
          S: {satStart != null && satEnd != null && satCurve != null ? (
            `${satStart} – ${satEnd} @ ${satRate}x ${satCurve}`
          ) : '--'}
        </Text>

        <Text
          fill={darkMode ? "#FFF" : "#121212"}
          fontSize={16}
          width="fill-parent"
          horizontalAlignText="left"
        >
          B: {brightStart != null && brightEnd != null && brightCurve != null ? (
            `${brightStart} – ${brightEnd} ${brightCurve}`
          ) : '--'}
        </Text>
      </AutoLayout>
    </AutoLayout>
  )
}

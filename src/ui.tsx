import { render, useWindowResize } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import { generate } from "@k-vyn/coloralgorithm";

import '!./output.css'
import Button from './components/Button';
import ImportView from './components/ImportView';
import TabItem from './components/TabItem';
import TextInput from './components/TextInput';
import Select from './components/Select';

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

function Plugin(props: { 
  specs: string, 
  colorScale: IColorScale,
  name: string,
  hueStart: number,
  hueEnd: number,
  hueCurve: string,
  satStart: number,
  satEnd: number,
  satCurve: string,
  satRate: number,
  brightStart: number,
  brightEnd: number,
  brightCurve: string
}) {
  const [mode, setMode] = useState('properties')
  const [specs, setSpecs] = useState(props.specs)
  const [colorScale, setColorScale] = useState(props.colorScale)
  const [name, setName] = useState(props.colorScale.name)

  const [hueStart, setHueStart] = useState(props.hueStart)
  const [hueEnd, setHueEnd] = useState(props.hueEnd)
  const [hueCurve, setHueCurve] = useState(props.hueCurve)

  const [satStart, setSatStart] = useState(props.satStart)
  const [satEnd, setSatEnd] = useState(props.satEnd)
  const [satCurve, setSatCurve] = useState(props.satCurve)
  const [satRate, setSatRate] = useState(props.satRate)

  const [brightStart, setBrightStart] = useState(props.brightStart)
  const [brightEnd, setBrightEnd] = useState(props.brightEnd)
  const [brightCurve, setBrightCurve] = useState(props.brightCurve)

  const curveOptions = [
    {label: 'Linear', value: 'linear'}, 
    {label: 'Cubic', value: 'Cubic'}, 
    {label: 'Quad', value: 'Quad'}, 
    {label: 'Quart', value: 'Quart'}, 
    {label: 'Sine', value: 'Sine'}, 
    {label: 'Quint', value: 'Quint'}
  ]
  const easingOptions = [
    {label: 'Linear', value: 'linear'}, 
    {label: 'Ease in', value: 'easeIn'}, 
    {label: 'Ease out', value: 'easeOut'}, 
    {label: 'Ease in out', value: 'easeInOut'}
  ]

  const [hueCurveType, setHueCurveType] = useState(splitCurve(props.hueCurve).type);
  const [hueEasing, setHueEasing] = useState(splitCurve(props.hueCurve).easing);

  const [satCurveType, setSatCurveType] = useState(splitCurve(props.satCurve).type);
  const [satEasing, setSatEasing] = useState(splitCurve(props.satCurve).easing);

  const [brightCurveType, setBrightCurveType] = useState(splitCurve(props.brightCurve).type);
  const [brightEasing, setBrightEasing] = useState(splitCurve(props.brightCurve).easing);

  function onWindowResize(windowSize: { width: number; height: number }) {
    emit('RESIZE_WINDOW', windowSize)
  }

  useWindowResize(onWindowResize, {
    minWidth: 360,
    minHeight: 440,
    maxWidth: 480,
    maxHeight: 720
  })

  const handleSpecsChange = useCallback((event: Event) => {
    const target = event.target as HTMLTextAreaElement
    const newSpecs = target.value
    setSpecs(newSpecs);
  }, []);

  // Splits 'easeOutQuad' into ['easeOut', 'Quad']
  function splitCurve(curve: string) {
    const match = curve.match(/(easeIn|easeOut|easeInOut)?(\w+)/i);
    if (match) {
      return {
        easing: match[1] || 'linear', // Default to 'linear' if no easing prefix
        type: match[2] || ''
      };
    } else {
      return {
        easing: 'linear',
        type: ''
      }
    }
  }

  // Combines easing and type unless type is 'linear'
  function combineCurve(easing: string, type: string) {

    return type === 'linear' ? 'linear' : `${easing}${type}`;
  }

  // Function to generate colors with updated JSON specs
  const handleUpdateButtonClick = useCallback(
    function () {
      console.log(specs)
      try {
        // Assuming the JSON is an array and we need the first element
        const parsedSpecs = JSON.parse(specs)[0]; // Access the first element of the array
        if (!parsedSpecs) {
          throw new Error("JSON does not contain any objects.");
        }
        const generatedScale = generate(parsedSpecs.properties, parsedSpecs.options); // Adjusted to match expected parameters
        setColorScale(generatedScale); // Generate colors

        // Save the individual specs parsed from the JSON
        setHueStart(parsedSpecs.properties.hue.start)
        setHueEnd(parsedSpecs.properties.hue.end)
        setHueCurve(parsedSpecs.properties.hue.curve)

        setSatStart(parsedSpecs.properties.saturation.start)
        setSatEnd(parsedSpecs.properties.saturation.end)
        setSatCurve(parsedSpecs.properties.saturation.curve)
        setSatRate(parsedSpecs.properties.saturation.rate)

        setBrightStart(parsedSpecs.properties.brightness.start)
        setBrightEnd(parsedSpecs.properties.brightness.end)
        setBrightCurve(parsedSpecs.properties.brightness.curve)

        emit('UPDATE_SPECS', specs);
        emit('UPDATE_COLORS', generatedScale);
      } catch (error) {
        console.error('Error during generation:', error);
        alert('Failed to generate color scale. Please check your input.');
      }
    },
    [specs]
  );

  const updateSpecsJson = (propertyPath: any, value: any) => {
    try {
      const specsObj = JSON.parse(specs);
      let properties = specsObj[0].properties; // Assuming the structure based on your code

      // Access properties dynamically
      propertyPath.reduce((acc: any, prop: any, index: any) => {
        if (index === propertyPath.length - 1) {
          acc[prop] = value;
        }
        return acc[prop];
      }, properties);

      // Set the updated specs
      setSpecs(JSON.stringify(specsObj));
    } catch (error) {
      console.error('Failed to update specs JSON:', error);
    }
  };

  const updateSpecsOptionsJson = (optionKey: string, value: string) => {
    try {
      const specsObj = JSON.parse(specs);
      if (specsObj && specsObj.length > 0) {
        specsObj[0].options[optionKey] = value;  // Directly update the key in options
        setSpecs(JSON.stringify(specsObj));
      }
    } catch (error) {
      console.error('Failed to update specs JSON:', error);
    }
  };

  const handleInputChange = (
    setter: (value: number) => void, 
    jsonPath: string[]
  ) => (event: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const newValue = Number(event.currentTarget.value);
    setter(newValue);
    updateSpecsJson(jsonPath, newValue);
  };

  return (
    <div class="bg-default overflow-scroll flex flex-col w-screen h-screen">
      <div class="flex border-b border-muted px-2 sticky w-full bg-default z-10">
        <TabItem
          label="Properties"
          selected={mode === 'properties' ? true : false}
          onClick={() => setMode('properties')}
        />

        <TabItem
          label="Import"
          selected={mode === 'import' ? true : false}
          onClick={() => setMode('import')}
        />
      </div>
      
      {mode === 'properties' ? (
        <div class="overflow-scroll flex flex-col w-full h-full gap-6 p-4">
          {/* HUE */}
          <div class="flex flex-col gap-3 border-b border-muted pb-5">
            <h2 class='text-lg'>Hue</h2>

            <div class='flex gap-3'>
              <TextInput 
                id='hueStart' 
                label='Start' 
                type='number' 
                value={hueStart || 0} 
                onInput={handleInputChange(setHueStart, ['hue', 'start'])}
              />

              <TextInput 
                id='hueEnd' 
                label='End' 
                type='number' 
                value={hueEnd || 0} 
                onInput={handleInputChange(setHueEnd, ['hue', 'end'])}
              />
            </div>

            <div class='flex gap-3'>
              <Select
                label="Curve"
                options={curveOptions}
                selection={hueCurveType}
                onChange={(event) => {
                  const target = event.target as HTMLSelectElement
                  const newType = target.value;
                  setHueCurveType(newType);
                  const newCurve = combineCurve(hueEasing, newType);
                  setHueCurve(newCurve);
                  updateSpecsJson(['hue', 'curve'], newCurve);
                }}
              />

              <Select
                label="Easing"
                options={easingOptions}
                selection={hueCurveType === 'linear' ? 'linear' : hueEasing}
                disabled={hueCurveType === 'linear' ? true : false}
                onChange={(event: Event) => {
                  const target = event.target as HTMLSelectElement
                  const newEasing = target.value;
                  setHueEasing(newEasing);
                  const newCurve = combineCurve(newEasing, hueCurveType);
                  setHueCurve(newCurve);
                  updateSpecsJson(['hue', 'curve'], newCurve);
                }}
              />
            </div>
          </div>

          {/* SATURATION */}
          <div class="flex flex-col gap-3 border-b border-muted pb-5">
            <h2 class='text-lg'>Saturation</h2>

            <div class='flex gap-3'>
              <TextInput 
                id='satStart' 
                label='Start' 
                type='number' 
                value={satStart || 0} 
                onInput={handleInputChange(setSatStart, ['saturation', 'start'])}
              />

              <TextInput 
                id='satEnd' 
                label='End' 
                type='number' 
                value={satEnd || 0} 
                onInput={handleInputChange(setSatEnd, ['saturation', 'end'])}
              />

              <TextInput
                id='satRate'
                label='Rate'
                type='number'
                value={satRate || 0}
                onInput={handleInputChange(setSatRate, ['saturation', 'rate'])}
              />
            </div>

            <div class='flex gap-3'>
              <Select
                label="Curve"
                options={curveOptions}
                selection={satCurveType}
                onChange={(event) => {
                  const target = event.target as HTMLSelectElement
                  const newType = target.value;
                  setSatCurveType(newType);
                  const newCurve = combineCurve(satEasing, newType);
                  setSatCurve(newCurve);
                  updateSpecsJson(['saturation', 'curve'], newCurve);
                }}
              />

              <Select
                label="Easing"
                options={easingOptions}
                selection={satCurveType === 'linear' ? 'linear' : satEasing}
                disabled={satCurveType === 'linear' ? true : false}
                onChange={(event: Event) => {
                  const target = event.target as HTMLSelectElement
                  const newEasing = target.value;
                  setSatEasing(newEasing);
                  const newCurve = combineCurve(newEasing, satCurveType);
                  setSatCurve(newCurve);
                  updateSpecsJson(['saturation', 'curve'], newCurve);
                }}
              />
            </div>
          </div>

          {/* BRIGHTNESS */}
          <div class="flex flex-col gap-3 border-b border-muted pb-5">
            <h2 class='text-lg'>Brightness</h2>

            <div class='flex gap-3'>
              <TextInput 
                id='brightStart' 
                label='Start' 
                type='number' 
                value={brightStart || 0} 
                onInput={handleInputChange(setBrightStart, ['brightness', 'start'])}
              />

              <TextInput 
                id='brightEnd' 
                label='End' 
                type='number' 
                value={brightEnd || 0} 
                onInput={handleInputChange(setBrightEnd, ['brightness', 'end'])}
              />
            </div>

            <div class='flex gap-3'>
              <Select
                label="Curve"
                options={curveOptions}
                selection={brightCurveType}
                onChange={(event) => {
                  const target = event.target as HTMLSelectElement
                  const newType = target.value;
                  setBrightCurveType(newType);
                  const newCurve = combineCurve(brightEasing, newType);
                  setBrightCurve(newCurve);
                  updateSpecsJson(['brightness', 'curve'], newCurve);
                }}
              />

              <Select
                label="Easing"
                options={easingOptions}
                selection={brightCurveType === 'linear' ? 'linear' : brightEasing}
                disabled={brightCurveType === 'linear' ? true : false}
                onChange={(event: Event) => {
                  const target = event.target as HTMLSelectElement
                  const newEasing = target.value;
                  setBrightEasing(newEasing);
                  const newCurve = combineCurve(newEasing, brightCurveType);
                  setBrightCurve(newCurve);
                  updateSpecsJson(['brightness', 'curve'], newCurve);
                }}
              />
            </div>            
          </div>

          {/* OPTIONS */}
          <div class="flex flex-col gap-3">
            <h2 class='text-lg'>Options</h2>

            <TextInput
              id='name'
              label='Name'
              value={name || 'New scale'}
              onInput={(event) => {
                const newValue = event.currentTarget.value;
                setName(newValue);
                updateSpecsOptionsJson('name', newValue);
              }}
            />
          </div>
            
          <Button label='Generate' onClick={handleUpdateButtonClick} />
        </div>
      ) : (
          <ImportView specs={specs} handleSpecsChange={handleSpecsChange} handleUpdateButtonClick={handleUpdateButtonClick} />
      )}
    </div>
  )
}

export default render(Plugin)

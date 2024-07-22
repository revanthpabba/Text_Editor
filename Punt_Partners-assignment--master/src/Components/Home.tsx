import '../CSS/Home.css';
import details from '../Assets/punt-frontend-assignment (1).json';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface FontVariants {
  [weight: string]: string;
}

interface FontDetails {
  [fontName: string]: FontVariants;
}

interface FontVariant {
  weight: number;
  italic: boolean;
}

const findClosestVariant = (
  desiredWeight: number,
  desiredItalic: boolean,
  availableVariants: FontVariant[]
): FontVariant => {
  const italicVariants = availableVariants.filter(variant => variant.italic);
  const nonItalicVariants = availableVariants.filter(variant => !variant.italic);

  const getClosestWeight = (weight: number, variants: FontVariant[]): FontVariant => {
    return variants.reduce((prev, curr) => 
      Math.abs(curr.weight - weight) < Math.abs(prev.weight - weight) ? curr : prev
    );
  };

  if (desiredItalic) {
    if (italicVariants.length > 0) {
      return getClosestWeight(desiredWeight, italicVariants);
    }
    return getClosestWeight(desiredWeight, nonItalicVariants);
  } else {
    if (nonItalicVariants.length > 0) {
      return getClosestWeight(desiredWeight, nonItalicVariants);
    }
    return getClosestWeight(desiredWeight, italicVariants);
  }
};

export const Home = () => {
  const fontDetails: FontDetails = details;
  const [text, setText] = useState('');
  const [toggle, setToggle] = useState(false);
  const [font, setFont] = useState<string>('');
  const [weidth, setWeidth] = useState<string>('');
  const [fontWeights, setFontWeights] = useState<FontVariants>({});

  useEffect(() => {
    const head = document.head;
    if (weidth && font) {
      let url = fontDetails[font][weidth];
      if (!url) {
        const availableVariants = Object.entries(fontDetails[font]).map(([variant]) => {
          const weight = parseInt(variant, 10);
          const italic = variant.includes('italic');
          return { weight, italic };
        });

        const closestVariant = findClosestVariant(parseInt(weidth), toggle, availableVariants);
        setWeidth(closestVariant.weight.toString());
        setToggle(closestVariant.italic);
        url = fontDetails[font][closestVariant.weight + (closestVariant.italic ? 'italic' : '')];
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute('data-font', font);
      head.appendChild(link);

      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: '${font}';
          font-weight: ${weidth};
          src: url(${url}) format('woff2');
        }
      `;
      head.appendChild(style);
    }
  }, [font, weidth, toggle]);

  useEffect(() => {
    if (font) {
      const newFontWeights: FontVariants = {};
      Object.entries(fontDetails[font]).forEach(([weight, url]) => {
        if (weight.length === 3) {
          newFontWeights[weight] = url;
        }
      });
      setFontWeights(newFontWeights);
    } else {
      setFontWeights({});
    }
  }, [font]);

  useEffect(() => {}, [text]);

  useEffect(() => {
    const savedText = localStorage.getItem('text');
    const savedFont = localStorage.getItem('font');
    const savedWeight = localStorage.getItem('weight');
    const savedItalic = localStorage.getItem('toggle');
    if (savedText) setText(savedText);
    if (savedFont) setFont(savedFont);
    if (savedWeight) setWeidth(savedWeight);
    if (savedItalic) setToggle(JSON.parse(savedItalic));
  }, []);

  const handlesave = () => {
    localStorage.setItem('text', text);
    localStorage.setItem('font', font);
    localStorage.setItem('weight', weidth);
    localStorage.setItem('toggle', JSON.stringify(toggle));
    toast.success('Data saved!');
  };

  const handlereset = () => {
    setText('');
    setFont('');
    setWeidth('');
    setToggle(false);
    localStorage.removeItem('text');
    localStorage.removeItem('font');
    localStorage.removeItem('weight');
    localStorage.removeItem('toggle');
    toast.success('Data Reset!');
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedFont = e.target.value;
    setFont(selectedFont);

    const availableVariants = Object.entries(fontDetails[selectedFont]).map(([variant]) => {
      const weight = parseInt(variant, 10);
      const italic = variant.includes('italic');
      return { weight, italic };
    });

    const closestVariant = findClosestVariant(parseInt(weidth) || 400, toggle, availableVariants);
    setWeidth(closestVariant.weight.toString());
    setToggle(closestVariant.italic);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedWeight = e.target.value;
    setWeidth(selectedWeight);
  };

  return (
    <>
      <ToastContainer />
      <div className='home-box'>
        <h1>Font family analyser</h1>
        <div className="container">
          <div className="desc-sec">
            <div className="font-family-sec">
              <select name="" id="" value={font} onChange={handleFontChange}>
                <option value="">Select Font</option>
                {Object.keys(details).map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            <div className="varient-sec">
              <select name="" id="" value={weidth} onChange={handleWeightChange}>
                <option value="">Select Weight</option>
                {!font ? '' : Object.keys(fontWeights).map((weidth) => (
                  <option key={weidth} value={weidth}>{weidth}</option>
                ))}
              </select>
            </div>
            <div className="toggle">
              <label>Italic</label>
              <button className='toggle-btn' onClick={() => setToggle(!toggle)} disabled={fontDetails[font] === undefined || fontDetails[font][weidth + 'italic'] === undefined}>{toggle ? 'OFF' : 'ON'}</button>
            </div>
          </div>
          <div className="text-sec">
            <textarea name="" id="" style={{ fontFamily: font, fontWeight: weidth, fontStyle: toggle ? 'italic' : 'normal' }} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="reset-save">
            <button className="btn" onClick={handlereset}>Reset</button>
            <button className="btn" onClick={handlesave}>Save</button>
          </div>
        </div>
      </div>
    </>
  );
};
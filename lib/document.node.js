import { createRequire } from 'module';
import PDFDocument from './document';
import LineWrapper from './line_wrapper';
import {
  registerStdFontLoaders,
  registerStdFonts,
} from './font/standard_fonts';
import { registerFile } from '#fs';

// A bundler that folds this module into its own output leaves `import.meta.url`
// undefined (CommonJS output) or pointing at the bundle (ESM output), and the
// bundle's package has no `#standard-fonts/*` mapping either way. Neither may
// fail before a document actually asks for a standard font, so the lookup falls
// back to a base createRequire accepts and a failed lookup explains itself.
const require = createRequire(import.meta.url ?? 'file:///');

const loaders = {
  Courier: () => require('#standard-fonts/Courier'),
  'Courier-Bold': () => require('#standard-fonts/CourierBold'),
  'Courier-BoldOblique': () => require('#standard-fonts/CourierBoldOblique'),
  'Courier-Oblique': () => require('#standard-fonts/CourierOblique'),
  Helvetica: () => require('#standard-fonts/Helvetica'),
  'Helvetica-Bold': () => require('#standard-fonts/HelveticaBold'),
  'Helvetica-BoldOblique': () =>
    require('#standard-fonts/HelveticaBoldOblique'),
  'Helvetica-Oblique': () => require('#standard-fonts/HelveticaOblique'),
  Symbol: () => require('#standard-fonts/Symbol'),
  'Times-Bold': () => require('#standard-fonts/TimesBold'),
  'Times-BoldItalic': () => require('#standard-fonts/TimesBoldItalic'),
  'Times-Italic': () => require('#standard-fonts/TimesItalic'),
  'Times-Roman': () => require('#standard-fonts/TimesRoman'),
  ZapfDingbats: () => require('#standard-fonts/ZapfDingbats'),
};

registerStdFontLoaders(
  Object.fromEntries(
    Object.entries(loaders).map(([name, load]) => [
      name,
      () => {
        try {
          return load();
        } catch (error) {
          if (error?.code !== 'MODULE_NOT_FOUND') {
            throw error;
          }

          throw new Error(
            `Cannot load the standard font "${name}" from pdfkit's package ` +
              'directory, which is not available once pdfkit is bundled ' +
              'into another file. Either mark pdfkit as external in the ' +
              'bundler, or import the fonts the document uses from ' +
              '"pdfkit/standard-fonts/<Name>" and pass them to ' +
              'registerStdFonts() before creating the document.',
            { cause: error },
          );
        }
      },
    ]),
  ),
);

export { PDFDocument, LineWrapper, registerStdFonts, registerFile };
export default PDFDocument;

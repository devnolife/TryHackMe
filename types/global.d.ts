// Type declarations for CSS imports
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Specific declaration for xterm CSS
declare module 'xterm/css/xterm.css';

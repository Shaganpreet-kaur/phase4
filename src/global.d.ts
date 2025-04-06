// Fix for TypeScript not detecting React Navigation types
declare module '@react-navigation/native' {
    export * from '@react-navigation/native/lib/typescript';
  }
  
  declare module '@react-navigation/native-stack' {
    export * from '@react-navigation/native-stack/lib/typescript';
  }
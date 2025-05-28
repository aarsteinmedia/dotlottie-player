declare module '*.css' {
  const content: string

  export default content
}

// declare module 'rollup-plugin-serve' {
//   interface Options {
//     contentBase?: string | string[]
//     port?: number
//     headers?: unknown
//     https?: boolean
//     openPage?: string
//     onListening?: (x?: unknown) => unknown
//   }
//   const serve: (options: Options) => void

//   export default serve
// }

/** @type {import('shadcn').Config} */
module.exports = {
  $schema: 'https://unpkg.com/shadcn@0.9.5/schema.json',
  components: './src/components',
  aliases: {
    utils: '@/lib/utils',
    sonner: 'sonner',
  },
  windows: {
    path: {
      normalize: true,
      useUnixStyle: false
    }
  }
}
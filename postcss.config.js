module.exports = ({ file, env }) => ({
  parser: file.extname === '.scss' ? 'postcss-scss' : false,
  plugins: {
    precss: file.extname === '.scss',
    cssnano: env === 'production' ? {} : false,
  },
})

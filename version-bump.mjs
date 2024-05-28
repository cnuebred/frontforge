import { readFileSync, writeFileSync } from "fs";

const separate_to_semantic_version_parts = (version) => {
  const [major, minor, build] = version.split('.')
  return { major: +major, minor: +minor, build: +build }
}

const bump = () => {
  let pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const { version } = pkg;

  let { major, minor, build } = separate_to_semantic_version_parts(version)
  const type = process.argv[2]
  if (type.toLowerCase() == 'major')
    major++
  else if (type.toLowerCase() == 'minor')
    minor++
  else
    build++
 
  pkg.version = `${major}.${minor}.${build}`
  writeFileSync("package.json", JSON.stringify(pkg, null, "\t"));
}

bump()
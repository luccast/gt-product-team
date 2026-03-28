import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const ROOT = import.meta.dir;
const SCRIPT = join(ROOT, '..', 'uninstall');

const tempDirs: string[] = [];

function makeTempDir(prefix: string) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function run(scriptPath: string, homeDir: string) {
  const result = Bun.spawnSync(['bash', scriptPath, '-y'], {
    cwd: homeDir,
    env: {
      ...process.env,
      HOME: homeDir,
    },
    stdout: 'pipe',
    stderr: 'pipe',
  });

  return {
    exitCode: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe('uninstall', () => {
  test('removes the global install and only matching gstack skill symlinks', () => {
    const homeDir = makeTempDir('gstack-uninstall-global-');
    const skillsDir = join(homeDir, '.claude', 'skills');
    const gstackDir = join(skillsDir, 'gstack');

    mkdirSync(join(gstackDir, 'review'), { recursive: true });
    mkdirSync(join(gstackDir, 'qa'), { recursive: true });
    writeFileSync(join(gstackDir, 'review', 'SKILL.md'), '# review\n');
    writeFileSync(join(gstackDir, 'qa', 'SKILL.md'), '# qa\n');
    symlinkSync('gstack/review', join(skillsDir, 'review'));
    symlinkSync('gstack/qa', join(skillsDir, 'qa'));
    symlinkSync('../elsewhere/review', join(skillsDir, 'other-review'));
    writeFileSync(join(skillsDir, 'README.txt'), 'keep me\n');

    const result = run(SCRIPT, homeDir);

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(skillsDir, 'review'))).toBe(false);
    expect(existsSync(join(skillsDir, 'qa'))).toBe(false);
    expect(lstatSync(join(skillsDir, 'other-review')).isSymbolicLink()).toBe(true);
    expect(existsSync(join(skillsDir, 'README.txt'))).toBe(true);
    expect(existsSync(gstackDir)).toBe(false);
  });

  test('removes a project-local vendored install and its skill symlink', () => {
    const projectDir = makeTempDir('gstack-uninstall-project-');
    const homeDir = makeTempDir('gstack-uninstall-home-');
    const skillsDir = join(projectDir, '.claude', 'skills');
    const gstackDir = join(skillsDir, 'gstack');

    mkdirSync(join(gstackDir, 'review'), { recursive: true });
    writeFileSync(join(gstackDir, 'review', 'SKILL.md'), '# review\n');
    symlinkSync('gstack/review', join(skillsDir, 'review'));
    symlinkSync(SCRIPT, join(gstackDir, 'uninstall'));

    const result = run(join(gstackDir, 'uninstall'), homeDir);

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(skillsDir, 'review'))).toBe(false);
    expect(existsSync(gstackDir)).toBe(false);
  });
});

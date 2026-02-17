const { execSync } = require('child_process');

function run() {
    try {
        const commits = execSync('git rev-list --all').toString().split('\n').filter(Boolean);
        console.log(`Checking ${commits.length} commits...`);

        for (const commit of commits) {
            const files = execSync(`git ls-tree -r ${commit} --name-only`).toString().split('\n').filter(Boolean);
            for (const file of files) {
                if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.txt')) {
                    try {
                        const content = execSync(`git show ${commit}:${file}`).toString();
                        if (content.includes('mongodb+srv://')) {
                            console.log(`FOUND IN COMMIT: ${commit} FILE: ${file}`);
                        }
                    } catch (err) {
                        // Skip files that can't be read
                    }
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
}

run();

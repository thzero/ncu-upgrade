const core = require('@actions/core');
const ncu = require('npm-check-updates');

try {
    let ncuOptions = core.getInput('ncu-options');
    const defaultOptions = {
        upgrade: true,
        jsonUpgraded: true,
        silent: false,
        packageManager: 'npm',
        // Without an explicit packageFile ncu falls back to reading package.json from
        // stdin, which never arrives on a runner: it gives up and resolves nothing, so
        // the outputs below are never set and every downstream `if:` silently sees ''.
        packageFile: 'package.json'
    };
    ncuOptions = ncuOptions ? { ...defaultOptions, ...ncuOptions } : defaultOptions;
    console.log(`ncu-options`, ncuOptions);

    ncu.run(ncuOptions)
        .then((upgrades) => {
            try {
                const result = upgrades ? (Object.keys(upgrades).length > 0) :  false;
                if (result) {
                    core.setOutput('upgraded', 1);
                    core.setOutput('upgrades', upgrades);
                    core.info('Upgraded.');
                }
                else {
                    core.info('No upgrades.');
                    core.setOutput('upgraded', 0);
                    core.setOutput('upgrades', '');
                }
                core.info(`upgraded: ${result ? 1 : 0}`);
            }
            catch (err) {
                core.error(err);
                core.setFailed(`Action failed with error ${err}`);
            }
        });
}
catch (err) {
    core.setFailed(`Action failed with error ${err}`);
}

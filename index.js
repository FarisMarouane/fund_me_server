import express, { json, urlencoded } from 'express';
import { spawn } from 'child_process';

const deploySmartContract = (fundRaiserAddress, campaignDuration) => {
  let promise = new Promise((resolve, reject) => {
    let fundProcess;

    const deployProcess = spawn(
      'brownie',
      ['run', 'deploy.py', '--network', 'kovan'],
      {
        cwd: '/home/marouane/webDev/solidity/brownie_fund_me/smart_contract/scripts',
        env: {
          ...process.env,
          fundRaiserAddress,
          duration: campaignDuration,
        },
      },
    );

    deployProcess.stdout.on('data', function (data) {
      console.log(`child process data: ${data}`);
    });

    deployProcess.on('error', (err) => {
      reject(new Error('Deploy process error:', err));
    });

    deployProcess.on('exit', function (code, signal) {
      console.log(
        'Deploy process exited with ' + `code ${code} and signal ${signal}`,
      );

      if (code === 0) {
        fundProcess = spawn(
          'brownie',
          ['run', 'fund.py', '--network', 'kovan'],
          {
            cwd: '/home/marouane/webDev/solidity/brownie_fund_me/smart_contract/scripts',
          },
        );

        fundProcess.stdout.on('data', function (data) {
          console.log(`child process data: ${data}`);
        });

        fundProcess.on('error', (err) => {
          reject(new Error('Fund process err:', err));
        });

        fundProcess.on('exit', function (code, signal) {
          console.log(
            'Fund process exited with ' + `code ${code} and signal ${signal}`,
          );
          if (code === 0) {
            resolve();
          } else {
            reject(new Error('Fund process exited with code:', code));
          }
        });
      } else {
        reject(new Error('Deploy process exited with code:', code));
      }
    });
  });

  return promise;
};

const app = express();
const port = 5000;

app.use(json());
app.use(urlencoded({ extended: true }));

app.post('/smart_contract', async (req, res) => {
  const { campaignDuration, campaignOwnerAddress } = req.body;
  try {
    await deploySmartContract(campaignOwnerAddress, campaignDuration);
    res.status(200).end();
  } catch (error) {
    res.status(500).end();
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

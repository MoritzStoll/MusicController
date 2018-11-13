// WebMidi.enable(err => {
//     if (err) {
//       console.error('WebMidi could not be enabled', err);
//       return;
//     }
//     document.querySelector('.midi-not-supported').style.display = 'none';

//     let withInputsMsg = document.querySelector('.midi-supported-with-inputs');
//     let noInputsMsg = document.querySelector('.midi-supported-no-inputs');
//     let inputSelector = document.querySelector('#midi-inputs');
//     let outputSelector = document.querySelector('#outputs');
//     let clockInputSelector = document.querySelector('#midi-clock-inputs');
//     let clockOutputSelector = document.querySelector('#midi-clock-outputs');
//     let activeInput,
//       activeClockInputId,
//       activeClockOutputId,
//       transportTickerId,
//       clockOutputTickerId,
//       midiTickCount,
//       lastBeatAt;

//     function onInputsChange() {
//       if (WebMidi.inputs.length === 0) {
//         withInputsMsg.style.display = 'none';
//         noInputsMsg.style.display = 'block';
//         onActiveInputChange(null);
//       } else {
//         noInputsMsg.style.display = 'none';
//         withInputsMsg.style.display = 'block';
//         while (inputSelector.firstChild) {
//           inputSelector.firstChild.remove();
//         }
//         for (let input of WebMidi.inputs) {
//           let option = document.createElement('option');
//           option.value = input.id;
//           option.innerText = input.name;
//           inputSelector.appendChild(option);
//         }
//         onActiveInputChange(WebMidi.inputs[0].id);
//       }
//     }

//     function onOutputsChange() {
//       while (outputSelector.firstChild) {
//         outputSelector.firstChild.remove();
//       }
//       let internalOption = document.createElement('option');
//       internalOption.value = 'internal';
//       internalOption.innerText = 'Internal synth';
//       outputSelector.appendChild(internalOption);
//       for (let output of WebMidi.outputs) {
//         let option = document.createElement('option');
//         option.value = output.id;
//         option.innerText = output.name;
//         outputSelector.appendChild(option);
//       }
//       onActiveOutputChange('internal');
//     }

//     function onClockInputsChange() {
//       if (WebMidi.inputs.length === 0) {
//         onActiveClockInputChange('none');
//       } else {
//         while (clockInputSelector.firstChild) {
//           clockInputSelector.firstChild.remove();
//         }
//         let option = document.createElement('option');
//         option.value = 'none';
//         option.innerText = 'None (internal clock)';
//         clockInputSelector.appendChild(option);

//         for (let input of WebMidi.inputs) {
//           option = document.createElement('option');
//           option.value = input.id;
//           option.innerText = input.name;
//           clockInputSelector.appendChild(option);
//         }
//         onActiveClockInputChange('none');
//       }
//     }

//     function onClockOutputsChange() {
//       while (clockOutputSelector.firstChild) {
//         clockOutputSelector.firstChild.remove();
//       }
//       let noneOption = document.createElement('option');
//       noneOption.value = 'none';
//       noneOption.innerText = 'Not sending';
//       clockOutputSelector.appendChild(noneOption);
//       for (let output of WebMidi.outputs) {
//         let option = document.createElement('option');
//         option.value = output.id;
//         option.innerText = output.name;
//         clockOutputSelector.appendChild(option);
//       }
//       onActiveClockOutputChange('none');
//     }

//     function onActiveInputChange(id) {
//       if (activeInput) {
//         activeInput.removeListener();
//       }
//       let input = WebMidi.getInputById(id);
//       if (input) {
//         input.addListener('noteon', 1, e => {
//           humanKeyDown(e.note.number, e.velocity);
//           hideUI();
//         });
//         input.addListener('controlchange', 1, e => {
//           if (e.controller.number === TEMPO_MIDI_CONTROLLER) {
//             Tone.Transport.bpm.value = (e.value / 128) * MAX_MIDI_BPM;
//             echo.delayTime.value = Tone.Time('8n.').toSeconds();
//           }
//         });
//         input.addListener('noteoff', 1, e => humanKeyUp(e.note.number));
//         for (let option of Array.from(inputSelector.children)) {
//           option.selected = option.value === id;
//         }
//         activeInput = input;
//       }
//     }

//     function onActiveOutputChange(id) {
//       if (activeOutput !== 'internal') {
//         outputs[activeOutput] = null;
//       }
//       activeOutput = id;
//       if (activeOutput !== 'internal') {
//         let output = WebMidi.getOutputById(id);
//         outputs[id] = {
//           play: (note, velocity = 1, time, hold = false) => {
//             if (!hold) {
//               let delay = (time - Tone.now()) * 1000;
//               let duration = Tone.Time('16n').toMilliseconds();
//               output.playNote(note, 'all', {
//                 time: delay > 0 ? `+${delay}` : WebMidi.now,
//                 velocity,
//                 duration
//               });
//             }
//           },
//           stop: (note, time) => {
//             let delay = (time - Tone.now()) * 1000;
//             output.stopNote(note, 2, {
//               time: delay > 0 ? `+${delay}` : WebMidi.now
//             });
//           }
//         };
//       }
//       for (let option of Array.from(outputSelector.children)) {
//         option.selected = option.value === id;
//       }
//     }

//     function startClockOutput() {
//       let output = WebMidi.getOutputById(activeClockOutputId);
//       clockOutputTickerId = Tone.Transport.scheduleRepeat(time => {
//         let startDelay = time - Tone.context.currentTime;
//         let quarter = Tone.Time('4n').toSeconds();
//         for (let i = 0; i < 24; i++) {
//           let tickDelay = startDelay + (quarter / 24) * i;
//           output.sendClock({ time: `+${tickDelay * 1000}` });
//         }
//       }, '4n');
//     }

//     function stopClockOutput() {
//       Tone.Transport.clear(clockOutputTickerId);
//     }

//     function onActiveClockOutputChange(id) {
//       if (activeClockOutputId !== 'none') {
//         stopClockOutput();
//       }
//       activeClockOutputId = id;
//       if (activeClockOutputId !== 'none') {
//         startClockOutput();
//       }
//       for (let option of Array.from(clockOutputSelector.children)) {
//         option.selected = option.value === id;
//       }
//     }

//     function incomingMidiClockStart() {
//       midiTickCount = 0;
//       tick = 0;
//     }

//     function incomingMidiClockStop() {
//       midiTickCount = 0;
//       applyHumanKeyChanges();
//     }

//     function incomingMidiClockTick(evt) {
//       if (midiTickCount % 24 === 0) {
//         if (lastBeatAt) {
//           let beatDur = evt.timestamp - lastBeatAt;
//           Tone.Transport.bpm.value = Math.round(60000 / beatDur);
//           // Not sure why this doesn't sync through the BPM automatically. But it doesn't.
//           echo.delayTime.value = Tone.Time('8n.').toSeconds();
//         }
//         lastBeatAt = evt.timestamp;
//       }
//       if (midiTickCount % 12 === 0) {
//         doTick();
//       }
//       midiTickCount++;
//     }

//     function onActiveClockInputChange(id) {
//       if (activeClockInputId === 'none') {
//         Tone.Transport.clear(transportTickerId);
//         transportTickerId = null;
//       } else if (activeClockInputId) {
//         let input = WebMidi.getInputById(activeClockInputId);
//         input.removeListener('start', 'all', incomingMidiClockStart);
//         input.removeListener('stop', 'all', incomingMidiClockStop);
//         input.removeListener('clock', 'all', incomingMidiClockTick);
//       }
//       activeClockInputId = id;
//       if (activeClockInputId === 'none') {
//         transportTickerId = Tone.Transport.scheduleRepeat(doTick, '8n');
//         Tone.Transport.bpm.value = DEFAULT_BPM;
//         echo.delayTime.value = Tone.Time('8n.').toSeconds();
//       } else {
//         let input = WebMidi.getInputById(id);
//         input.addListener('start', 'all', incomingMidiClockStart);
//         input.addListener('stop', 'all', incomingMidiClockStop);
//         input.addListener('clock', 'all', incomingMidiClockTick);
//         midiTickCount = 0;
//       }
//       for (let option of Array.from(clockInputSelector.children)) {
//         option.selected = option.value === id;
//       }
//     }

//     onInputsChange();
//     onOutputsChange();
//     onClockInputsChange();
//     onClockOutputsChange();

//     WebMidi.addListener(
//       'connected',
//       () => (
//         onInputsChange(),
//         onOutputsChange(),
//         onClockInputsChange(),
//         onClockOutputsChange()
//       )
//     );
//     WebMidi.addListener(
//       'disconnected',
//       () => (
//         onInputsChange(),
//         onOutputsChange(),
//         onClockInputsChange(),
//         onClockOutputsChange()
//       )
//     );
//     inputSelector.addEventListener('change', evt =>
//       onActiveInputChange(evt.target.value)
//     );
//     outputSelector.addEventListener('change', evt =>
//       onActiveOutputChange(evt.target.value)
//     );
//     clockInputSelector.addEventListener('change', evt =>
//       onActiveClockInputChange(evt.target.value)
//     );
//     clockOutputSelector.addEventListener('change', evt =>
//       onActiveClockOutputChange(evt.target.value)
//     );
//   });

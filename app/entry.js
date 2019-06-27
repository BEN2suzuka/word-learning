'use strict';
import $ from 'jquery';

$('.memory-toggle-button').each((index, element) => {
  const button = $(element);
  button.click(() => {
    const userId = button.data('user-id');
    const wordId = button.data('word-id');
    const wordGroupId = button.data('wordgroup-id');
    const memory = button.data('memory');
    const nextmemory = (memory + 1) % 2;
    $.post(`/wordgroups/${wordGroupId}/words/${wordId}/users/${userId}`,
    { memory: nextmemory },
    (data) => {
      button.data('memory', data.memory);
      const memoryLabels = ['まだ', 'OK!'];
      button.text(memoryLabels[data.memory]);
    });
  });
});

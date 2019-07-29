'use strict';
import $ from 'jquery';
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';

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
      const memoryLabels = ['まだ！', '覚えた'];
      button.text(memoryLabels[data.memory]);
      const buttonStyles = ['btn-warning', 'btn-success'];
      button.removeClass('btn-warning btn-success');
      button.addClass(buttonStyles[data.memory]);
    });
  });
});

$('.favorite-toggle-button').each((index, element) => {
  const button = $(element);
  button.click(() => {
    const userId = button.data('user-id');
    const wordGroupId = button.data('wordgroup-id');
    const favorite = button.data('favorite');
    const nextFavorite = (favorite + 1) % 2;
    $.post(`/wordgroups/${wordGroupId}/users/${userId}/favorite`,
    { favorite: nextFavorite },
    (data) => {
      button.data('favorite', data.favorite);
      const favoriteLabels = ['ブックマークに追加', 'ブックマークを解除'];
      button.text(favoriteLabels[data.favorite]);
      const favoriteButtonStyles = ['btn-success', 'btn-warning'];
      button.removeClass('btn-success btn-warning');
      button.addClass(favoriteButtonStyles[data.favorite]);
    });
  });
});

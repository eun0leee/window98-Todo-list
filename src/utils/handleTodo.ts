import {
  getServerTodos,
  addServerTodos,
  editServerTodos,
  deleteServerTodos,
} from '@api/todo';
import {
  showLoading,
  hideLoading,
  showEl,
  hideEl,
  loadingEl,
  todoUlEl,
  emptyMessageEl,
} from '@utils/store';
import renderTodoList from '@utils/render';
import { IRes } from '@/types/todo';

// get
const handleGetTodos = async (filterType?: string) => {
  showLoading(loadingEl);

  try {
    const data: IRes[] = await getServerTodos();

    // 업데이트순 정렬
    const sortedData = [...data].sort((a, b) => {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    });

    // ul classlist 에 filter 관련 있으면 필터
    const renderData = filterType
      ? sortedData.filter((el) => el.done === (filterType !== 'onlytodo-btn'))
      : sortedData;

    //서버 todo list 아예 없을 때와 있을 때
    if (renderData.length === 0) {
      showEl(emptyMessageEl);
    } else {
      hideEl(emptyMessageEl);
      renderData.forEach((item) => renderTodoList(item));
    }

    hideLoading(loadingEl);
  } catch (error) {
    console.log(error);
  }
};

// add
const handleAddTodos = async (e: any) => {
  e.preventDefault();
  console.log(e);
  try {
    const todoValue = e.target[0].value;
    // input 에 값 입력 했을 때
    if (todoValue !== '') {
      hideEl(emptyMessageEl);
      const title = todoValue;
      // input 값 비우기
      e.target[0].value = '';
      // 서버로 전송
      let data = await addServerTodos({ title });
      renderTodoList(data);
    } else {
      alert('please type your Todo ⌨️ !');
    }
  } catch (error) {
    console.log(error);
  }
};

// delete
const handleDeleteTodo = async (e: any) => {
  try {
    const todoLiEl = e.target.parentElement;
    // 화면상 todo list 삭제
    todoLiEl.remove();
    // 서버상 todo list 삭제
    await deleteServerTodos(todoLiEl.id);
    // 모두 삭제 됐을 때, 문구표시
    const data = await getServerTodos();
    if (data.length === 0) {
      showEl(emptyMessageEl);
    }
  } catch (error) {
    console.log(error);
  }
};

// edit
const handleEditTodo = (e: any) => {
  const todoLiEl = e.target.parentElement;
  const todoText = todoLiEl.querySelector('.textValue');

  // 수정 폼 열기
  todoLiEl.innerHTML = `<form action="GET" class="todoedit-form">
    <input class="todoedit-form-value" value="${todoText.innerText}">
    <button class="todoedit-form-okbtn" type="submit" value="ok">ok</button>
    <button class="todoedit-form-cancelbtn" type="button" value="cancel">cancel</button>
    </form>`;

  const editForm = todoLiEl.querySelector('.todoedit-form');
  const editInput = todoLiEl.querySelector('.todoedit-form-value');
  const editCancelBtn = todoLiEl.querySelector('.todoedit-form-cancelbtn');

  // 수정 완료 이벤트
  editForm.addEventListener('submit', (e: any) => {
    e.preventDefault();
    if (todoText.innerText !== editInput.value) {
      completedEdit(e, editInput.value, false);
    } else {
      alert('Nothing has changed! 🧐');
    }
  });

  // 수정 취소 이벤트
  editCancelBtn.addEventListener('click', () => cancelEdit());

  const completedEdit = async (e: any, title: string, done: boolean) => {
    const todoLiEl = e.target.parentElement;
    const id = todoLiEl.id;
    const data = await editServerTodos({ id, title, done });
    todoLiEl.remove();
    renderTodoList(data);
  };

  const cancelEdit = async () => {
    if (!todoUlEl) return;
    todoUlEl.innerHTML = '';
    handleGetTodos();
  };
};

// check
const handleCheckTodo = async (e: any) => {
  const todoLiEl = e.target.parentElement;
  const title = todoLiEl.querySelector('.textValue').innerText;
  const done = e.target.checked;
  const id = todoLiEl.id;
  const data = await editServerTodos({ id, title, done });

  // filter 걸려있을 때, 체크하면 목록에서 제거만 됨.
  todoLiEl.remove();

  if (!todoUlEl) return;

  todoUlEl.classList.contains('onlytodo-btn') ||
  todoUlEl.classList.contains('onlydone-btn')
    ? ''
    : renderTodoList(data);

  todoUlEl.querySelector('li') === null
    ? showEl(emptyMessageEl)
    : hideEl(emptyMessageEl);
};

// filter
const handleFilter = (e: any) => {
  if (!todoUlEl) return;

  const todoLiEl = todoUlEl.querySelectorAll('li');

  // ul 에서 li만 삭제
  todoLiEl.forEach((li) => {
    li.remove();
  });

  // className 에 따른 함수 인자
  const targetClassName = e.target.className;
  targetClassName === 'all-btn'
    ? handleGetTodos()
    : handleGetTodos(targetClassName);

  // ul에 className 추가
  todoUlEl.className = `todo-list ${targetClassName}`;
};

export {
  handleGetTodos,
  handleAddTodos,
  handleDeleteTodo,
  handleEditTodo,
  handleCheckTodo,
  handleFilter,
};

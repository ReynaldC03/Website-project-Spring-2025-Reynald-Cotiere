// Default Books
function addDefaultBooks() {
  const defaultBooks = [
    "Diary of a Wimpy Kid",
    "Rodrick Rules",
    "The Last Straw (Diary of a Wimpy Kid #3)",
    "Harry Potter and the Sorcerer's Stone",
    "Harry Potter and the Chamber of Secrets",
    "Harry Potter and the Prisoner of Azkaban"
  ];

  defaultBooks.forEach(async (title) => {
    const bookDetails = await fetchBookDetails(title);
    const cover = bookDetails.cover || 'No cover available';
    const author = bookDetails.author || "Unknown Author";
    const genre = bookDetails.genre || "Unknown Genre";

    const tableBody = document.querySelector('#bookTable tbody');
    const newRow = document.createElement('tr');

    // Adding a new row
    newRow.innerHTML = `
      <td><img src="${cover}" alt="${title}" width="50"></td>
      <td>${title}</td>
      <td>${author}</td>
      <td>${genre}</td>
      <td>
        <select class="form-select status-select">
          <option value="to read" selected>To Read</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </td>
      <td>
        <div class="d-flex align-items-center">
          <input type="number" class="form-control rating-input" min="0" max="5" step="0.1" value="0" style="width: 80px;">
          <span class="ms-2">/5</span>
        </div>
        <div class="text-danger rating-error" style="display: none;">Rating must be between 0 and 5.</div>
      </td>
      <td>
        <button class="btn btn-danger btn-sm delete-btn">Delete</button>
      </td>
      <td>
        <select class="form-select group-select">
          <option value="">No Group</option>
        </select>
      </td>
    `;

    tableBody.appendChild(newRow);
    addRatingInputListeners(newRow);
    addGroupSelectListeners(newRow);
    addStatusSelectListeners(newRow);
  });

  setTimeout(updateGroupRatings, 500);
}

// Call addDefaultBooks on page load
document.addEventListener('DOMContentLoaded', addDefaultBooks);

// Add Book
document.getElementById('addForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const genre = document.getElementById('genre').value;
  const status = document.getElementById('status').value;
  const rating = document.getElementById('rating').value || 0;

  // Fetch book details from Google API
  const bookDetails = await fetchBookDetails(title);
  const correctedTitle = bookDetails.title || title;
  const cover = bookDetails.cover || 'No cover available';
  const autoAuthor = bookDetails.author || "Unknown Author";
  const autoGenre = bookDetails.genre || "Unknown Genre";

  const tableBody = document.querySelector('#bookTable tbody');
  const newRow = document.createElement('tr');

  // Adding a new row
  newRow.innerHTML = `
    <td><img src="${cover}" alt="${correctedTitle}" width="50"></td>
    <td>${correctedTitle}</td>
    <td>${author || autoAuthor}</td>
    <td>${genre || autoGenre}</td>
    <td>
      <select class="form-select status-select">
        <option value="to read" ${status === 'to read' ? 'selected' : ''}>To Read</option>
        <option value="in progress" ${status === 'in progress' ? 'selected' : ''}>In Progress</option>
        <option value="completed" ${status === 'completed' ? 'selected' : ''}>Completed</option>
      </select>
    </td>
    <td>
      <div class="d-flex align-items-center">
        <input type="number" class="form-control rating-input" min="0" max="5" step="0.1" value="${rating}" style="width: 80px;">
        <span class="ms-2">/5</span>
      </div>
      <div class="text-danger rating-error" style="display: none;">Rating must be between 0 and 5.</div>
    </td>
    <td>
      <button class="btn btn-danger btn-sm delete-btn">Delete</button>
    </td>
    <td>
      <select class="form-select group-select">
        <option value="">No Group</option>
        ${getGroupOptions()}
      </select>
    </td>
  `;

  tableBody.appendChild(newRow);

  // Reset after book is added
  document.getElementById('addForm').reset();
  document.getElementById('ratingField').style.display = 'none';
  document.getElementById('ratingError').style.display = 'none';
  

  addRatingInputListeners(newRow);
  addGroupSelectListeners(newRow);
  addStatusSelectListeners(newRow);


  updateGroupRatings();
});

// Fetch Book Details (Title, Cover, Author, Genre) from Google Books API
async function fetchBookDetails(title) {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(title)}`);
    const data = await response.json();
    const book = data.items?.[0]?.volumeInfo;
    return {
      title: book?.title || null, // Corrected title
      cover: book?.imageLinks?.thumbnail || null,
      author: book?.authors?.[0] || null,
      genre: book?.categories?.[0] || null,
    };
  } catch (error) {
    console.error("Error fetching book details:", error);
    return {
      title: null,
      cover: null,
      author: null,
      genre: null,
    };
  }
}

// Group Creation
document.getElementById('createGroupBtn').addEventListener('click', function () {
  const groupName = document.getElementById('groupNameInput').value.trim();
  if (!groupName) return;
  
  // Checks if group with same name already exists
  const existingGroups = Array.from(document.querySelectorAll('#groupList li')).map(
    li => li.textContent.split(' ')[0]
  );
  
  if (existingGroups.includes(groupName)) {
    alert("A group with this name already exists!");
    return;
  }

  const groupList = document.getElementById('groupList');
  const newGroup = document.createElement('li');
  newGroup.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
  newGroup.innerHTML = `
    ${groupName}
    <span class="badge bg-secondary">0/5</span>
  `;
  groupList.appendChild(newGroup);

  updateGroupDropdowns();

  document.getElementById('groupNameInput').value = ''; 

  updateGroupRatings();
});

function getGroupOptions() {
  const groupItems = document.querySelectorAll('#groupList li');
  let options = '<option value="">No Group</option>'; // Default Group
  
  groupItems.forEach(group => {
    const groupText = group.textContent.trim();
    const groupName = groupText.split(' ')[0];
    
    if (groupName !== "No") {
      options += `<option value="${groupName}">${groupName}</option>`;
    }
  });
  
  return options;
}

// Update Group Dropdowns
function updateGroupDropdowns() {
  const groupOptions = getGroupOptions();
  const groupSelects = document.querySelectorAll('#bookTable tbody tr .group-select');
  
  groupSelects.forEach(select => {
    const currentSelection = select.value;
    select.innerHTML = groupOptions;
    if (currentSelection) {
      select.value = currentSelection;
    }
  });
}

//Group Select
function addGroupSelectListeners(row) {
  const groupSelect = row.querySelector('.group-select');
  groupSelect.addEventListener('change', function () {
    updateGroupRatings(); // Update group ratings when a book is moved to a group
  });
}

//Status Select
function addStatusSelectListeners(row) {
  const statusSelect = row.querySelector('.status-select');
  statusSelect.addEventListener('change', function () {
    const celebration = document.getElementById('celebration');
    if (this.value === 'completed') {
      celebration.style.display = 'block';
      setTimeout(() => {
        celebration.style.display = 'none';
      }, 3000);
    }
  });
}

//Rating Input
function addRatingInputListeners(row) {
  const ratingInput = row.querySelector('.rating-input');
  const ratingError = row.querySelector('.rating-error');

  ratingInput.addEventListener('input', function () {
    const ratingValue = parseFloat(this.value);
    if (ratingValue > 5) {
      ratingError.style.display = 'block';
      this.value = 5; // Cap at max value
    } else if (ratingValue < 0) {
      ratingError.style.display = 'block';
      this.value = 0; // Cap at min value
    } else {
      ratingError.style.display = 'none';
    }
    updateGroupRatings(); // Update group ratings when a book's rating changes
  });
}

// Update Group Ratings
function updateGroupRatings() {
  const groupItems = document.querySelectorAll('#groupList li');
  const rows = document.querySelectorAll('#bookTable tbody tr');

  // Reset and calculate for each group
  groupItems.forEach(group => {
    const groupName = group.textContent.split(' ')[0]; // Extract group name
    let totalRating = 0;
    let count = 0;

    // For each book row in the table
    rows.forEach(row => {
      const groupSelect = row.querySelector('.group-select');
      // Check if this book belongs to current group
      if (groupSelect) {
        const selectedGroup = groupSelect.value;
        if ((groupName === "No" && selectedGroup === "") || 
            (groupName !== "No" && selectedGroup === groupName)) {
          const ratingInput = row.querySelector('.rating-input');
          if (ratingInput) {
            const rating = parseFloat(ratingInput.value) || 0;
            if (rating > 0) {
              totalRating += rating;
              count++;
            }
          }
        }
      }
    });

    // Calculate and update average
    const avgRating = count > 0 ? (totalRating / count).toFixed(1) : 0;
    const badge = group.querySelector('.badge');
    if (badge) {
      badge.textContent = `${avgRating}/5`;
    }
  });
}

// Show/Hide Rating Field Based on Status
document.getElementById('status').addEventListener('change', function () {
  const ratingField = document.getElementById('ratingField');
  if (this.value === 'completed') {
    ratingField.style.display = 'block';
  } else {
    ratingField.style.display = 'none';
    document.getElementById('rating').value = 0;
    document.getElementById('ratingError').style.display = 'none';
  }
});

// Delete Book
document.getElementById('bookTable').addEventListener('click', function (event) {
  if (event.target.classList.contains('delete-btn')) {
    event.target.closest('tr').remove();
    updateGroupRatings(); // Update group ratings when a book is deleted
  }
});

// Toggle Groups Section Visibility
document.getElementById('toggleGroupsBtn').addEventListener('click', function () {
  const groupsSection = document.getElementById('groupsSection');
  if (groupsSection.style.display === 'none') {
    groupsSection.style.display = 'block';
    this.textContent = 'Hide Groups';
  } else {
    groupsSection.style.display = 'none';
    this.textContent = 'Show Groups';
  }
});

// Filter Dropdown
document.querySelectorAll('.dropdown-item').forEach(item => {
  item.addEventListener('click', function (event) {
    event.preventDefault();
    const filterType = this.getAttribute('data-filter');

    if (filterType === 'sortBy') {
      document.getElementById('sortBySection').style.display = 'block';
      document.getElementById('groupBySection').style.display = 'none';
    } else if (filterType === 'groupBy') {
      document.getElementById('groupBySection').style.display = 'block';
      document.getElementById('sortBySection').style.display = 'none';
    }
  });
});

// Search
document.getElementById('searchInput').addEventListener('input', function() {
  const searchTerm = this.value.toLowerCase();
  const rows = document.querySelectorAll('#bookTable tbody tr');
  
  rows.forEach(row => {
    // Skips group
    if (row.classList.contains('group-header')) return;
    
    const title = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
    const author = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
    const genre = row.querySelector('td:nth-child(4)').textContent.toLowerCase();
    
    // Show row if any field contains the search term
    if (title.includes(searchTerm) || 
        author.includes(searchTerm) || 
        genre.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
});

// Sort
document.getElementById('sortBy').addEventListener('change', function() {
  const sortBy = this.value;
  const tbody = document.querySelector('#bookTable tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // Sort rows based on selected column
  rows.sort((a, b) => {
    // Skip group headers in grouped view
    if (a.classList.contains('group-header') || b.classList.contains('group-header')) 
      return 0;
      
    let aValue, bValue;
    
    switch(sortBy) {
      case 'title':
        aValue = a.querySelector('td:nth-child(2)').textContent.toLowerCase();
        bValue = b.querySelector('td:nth-child(2)').textContent.toLowerCase();
        break;
      case 'author':
        aValue = a.querySelector('td:nth-child(3)').textContent.toLowerCase();
        bValue = b.querySelector('td:nth-child(3)').textContent.toLowerCase();
        break;
      case 'genre':
        aValue = a.querySelector('td:nth-child(4)').textContent.toLowerCase();
        bValue = b.querySelector('td:nth-child(4)').textContent.toLowerCase();
        break;
      case 'status':
        aValue = a.querySelector('td:nth-child(5) select').value;
        bValue = b.querySelector('td:nth-child(5) select').value;
        break;
      default:
        return 0;
    }
    
    return aValue.localeCompare(bValue);
  });
  
  // Clear and re-append sorted rows
  tbody.innerHTML = '';
  rows.forEach(row => tbody.appendChild(row));
});

// Group By
document.getElementById('groupBy').addEventListener('change', function() {
  const groupBy = this.value;
  const table = document.getElementById('bookTable');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => !row.classList.contains('group-header'));
  
  // Clear the table body
  tbody.innerHTML = '';
  
  if (groupBy === 'none') {
    // Just re-add all rows without grouping
    rows.forEach(row => tbody.appendChild(row));
    return;
  }
  
  // Group the rows
  const groups = {};
  rows.forEach(row => {
    let groupValue;
    
    switch(groupBy) {
      case 'author':
        groupValue = row.querySelector('td:nth-child(3)').textContent;
        break;
      case 'series':
        const title = row.querySelector('td:nth-child(2)').textContent;
        groupValue = title.split(/[:(]/)[0].trim();
        break;
      default:
        groupValue = 'Ungrouped';
    }
    
    if (!groups[groupValue]) {
      groups[groupValue] = [];
    }
    groups[groupValue].push(row);
  });
  
  // Add group headers and rows
  Object.keys(groups).sort().forEach(groupValue => {
    // Add group header
    const headerRow = document.createElement('tr');
    headerRow.className = 'table-secondary group-header';
    headerRow.innerHTML = `<td colspan="8"><strong>${groupValue}</strong> (${groups[groupValue].length} books)</td>`;
    tbody.appendChild(headerRow);
    
    // Add group rows
    groups[groupValue].forEach(row => tbody.appendChild(row));
  });
});
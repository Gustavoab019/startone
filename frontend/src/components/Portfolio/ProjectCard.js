import React, { useState } from 'react';
import EditProjectModal from './Modals/EditProjectModal';
import styles from './styles.module.css';

const ProjectCard = ({ project, onEdit }) => {
 const [isEditing, setIsEditing] = useState(false);

 const openEditModal = () => setIsEditing(true);
 const closeEditModal = () => setIsEditing(false);

 const formatDate = (date) => {
   if (!date) return 'No date provided';
   const options = { year: 'numeric', month: 'long', day: 'numeric' };
   return new Date(date).toLocaleDateString('pt-BR', options);
 };

 const statusClass = project.status
    ? `status-${project.status.replace(' ', '').toLowerCase()}`
    : '';

 return (
   <tr>
     <td>
       <div className={styles.projectInfo}>
         <span className={styles.projectName}>{project.projectTitle}</span>
         <span className={styles.projectDesc}>{project.description}</span>
       </div>
     </td>
     <td>
        <span className={styles.statusBadge}>
        {project.activeEmployeesCount} funcionário(s)
        </span>
      </td>
     <td>
      <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
        {project.status}
      </span>
    </td>
     <td>{formatDate(project.completionDate)}</td>
     <td>
       <div className={styles.actions}>
         <button className={styles.editButton} onClick={openEditModal}>
           Editar
         </button>
         <button className={styles.removeButton}>
           Remover
         </button>
       </div>
     </td>

     <EditProjectModal
       project={project}
       isOpen={isEditing}
       onClose={closeEditModal}
       onEdit={onEdit}
     />
   </tr>
 );
};

export default ProjectCard;
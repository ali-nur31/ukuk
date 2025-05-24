const { User, Professional, ProfessionalDetails } = require('../models');

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, существует ли пользователь
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Проверяем, что пользователь удаляет свой аккаунт или это админ
    if (user.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    // Если пользователь является профессионалом, удаляем связанные данные
    const professional = await Professional.findOne({ where: { userId: id } });
    if (professional) {
      // Удаляем детали профессионала
      await ProfessionalDetails.destroy({
        where: { professionalId: professional.id }
      });

      // Удаляем запись профессионала
      await professional.destroy();
    }

    // Удаляем пользователя
    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
}; 